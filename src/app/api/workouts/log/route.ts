import { NextResponse } from "next/server";
import { calculateXp, levelFromXp } from "@/lib/xp-engine";
import { isLocalAuthMode } from "@/lib/auth/config";
import { getLocalSessionUser } from "@/lib/auth/session";
import { persistUserState } from "@/lib/local/mutations";
import { applyExerciseXpToSkills } from "@/lib/workout-progression";
import { randomUUID } from "crypto";
export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const sessionUser = await getLocalSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { exerciseId, weight, reps, sets, rpe, notes } = body as {
    exerciseId: string;
    weight?: number;
    reps?: number;
    sets?: number;
    rpe?: number;
    notes?: string;
  };

  let xpEarned = 0;
  let isPr = false;
  let previousLevel = 0;
  let playerLevel = 0;
  let sessionId: string | null = null;

  await persistUserState(sessionUser.id, (state) => {
    const ex = state.exercises?.find((e) => e.id === exerciseId);
    if (!ex) return;

    previousLevel = state.profile.player_level;
    const active = state.workoutSessions?.find((s) => s.is_active);
    sessionId = active?.id ?? null;

    const xp = calculateXp({
      baseXp: ex.base_xp,
      streakDays: 0,
      momentumScore: state.profile.momentum_score,
      consistencyScore: state.profile.consistency_score,
    });
    xpEarned = xp.finalXp;

    if (weight != null && (ex.personal_record == null || weight > ex.personal_record)) {
      ex.personal_record = weight;
      isPr = true;
      xpEarned = Math.round(xpEarned * 1.5);
    }

    ex.total_xp += xpEarned;
    ex.level = levelFromXp(ex.total_xp);
    ex.frequency_score += 1;

    applyExerciseXpToSkills(state, ex, xpEarned);

    state.profile.total_xp += xpEarned;
    state.profile.player_level = levelFromXp(state.profile.total_xp);
    playerLevel = state.profile.player_level;

    const skill = state.skills?.find((s) => s.id === ex.skill_id);

    if (!state.workoutLogs) state.workoutLogs = [];
    state.workoutLogs.unshift({
      id: randomUUID(),
      exercise_id: exerciseId,
      exercise_name: ex.name,
      session_id: sessionId,
      skill_slug: skill?.slug ?? ex.muscle_group,
      logged_at: new Date().toISOString(),
      weight: weight ?? null,
      reps: reps ?? null,
      sets: sets ?? null,
      rpe: rpe ?? null,
      notes: notes ?? null,
      xp_earned: xpEarned,
      is_pr: isPr,
    });
    state.workoutLogs = state.workoutLogs.slice(0, 100);

    if (active) {
      active.exercise_count += 1;
      active.total_xp += xpEarned;
    }

    state.recentXpEvents = [
      {
        id: randomUUID(),
        user_id: sessionUser.id,
        entity_type: "exercise",
        entity_id: exerciseId,
        base_xp: xp.baseXp,
        final_xp: xpEarned,
        streak_multiplier: xp.multipliers.streak,
        combo_multiplier: xp.multipliers.combo,
        consistency_multiplier: xp.multipliers.consistency,
        momentum_multiplier: xp.multipliers.momentum,
        bonus_multiplier: xp.multipliers.bonus,
        reason: `${ex.name}${isPr ? " — PR!" : ""}`,
        metadata: { session_id: sessionId },
        created_at: new Date().toISOString(),
      },
      ...state.recentXpEvents,
    ].slice(0, 100);
  });

  return NextResponse.json({
    success: true,
    xpEarned,
    isPr,
    previousLevel,
    playerLevel,
    leveledUp: playerLevel > previousLevel,
    sessionId,
  });
}
