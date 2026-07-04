import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { calculateXp } from "@/lib/xp-engine";
import type { WorkoutLogEntry } from "@/types/database";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as {
    exerciseIds?: string[];
    sets?: number;
    reps?: number;
    weight?: number;
    dropSets?: number;
    failureReps?: number;
  };

  if (!body.exerciseIds?.length) {
    return NextResponse.json({ error: "exerciseIds required" }, { status: 400 });
  }

  try {
    const holder = { xpEarned: 0 };
    await withGameState((state) => {
      let totalXp = 0;
      for (const exerciseId of body.exerciseIds!) {
        const ex = state.exercises?.find((e) => e.id === exerciseId);
        if (!ex) continue;
        const xp = calculateXp({
          baseXp: ex.base_xp,
          streakDays: 0,
          momentumScore: state.profile.momentum_score,
          consistencyScore: state.profile.consistency_score,
        });
        totalXp += xp.finalXp;

        state.workoutLogs = state.workoutLogs ?? [];
        state.workoutLogs.push({
          id: randomUUID(),
          exercise_id: exerciseId,
          exercise_name: ex.name,
          session_id: null,
          skill_slug: ex.slug ?? null,
          weight: body.weight ?? null,
          reps: body.reps ?? null,
          sets: body.sets ?? null,
          logged_at: new Date().toISOString(),
          xp_earned: xp.finalXp,
          is_pr: false,
          notes: body.failureReps ? `failure reps: ${body.failureReps}` : null,
          metadata: {
            superset: true,
            superset_group: body.exerciseIds,
            drop_sets: body.dropSets,
            failure_reps: body.failureReps,
          },
        } as WorkoutLogEntry & { metadata?: Record<string, unknown> });
      }
      state.profile.total_xp += totalXp;
      holder.xpEarned = totalXp;
    });
    return NextResponse.json({ success: true, xpEarned: holder.xpEarned });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
