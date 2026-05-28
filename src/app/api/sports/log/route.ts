import { NextResponse } from "next/server";
import { calculateXp, levelFromXp, rankFromLevel } from "@/lib/xp-engine";
import { isLocalAuthMode } from "@/lib/auth/config";
import { getLocalSessionUser } from "@/lib/auth/session";
import { persistUserState } from "@/lib/local/mutations";
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
  const { sportId, durationMinutes } = body as {
    sportId: string;
    durationMinutes?: number;
  };

  let xpEarned = 0;
  let previousLevel = 0;
  let playerLevel = 0;

  await persistUserState(sessionUser.id, (state) => {
    const sport = state.sports?.find((s) => s.id === sportId);
    if (!sport || sport.played_today) return;

    previousLevel = state.profile.player_level;

    const xp = calculateXp({
      baseXp: sport.base_xp + Math.min(20, Math.floor((durationMinutes ?? 30) / 15)),
      streakDays: sport.current_streak,
      momentumScore: state.profile.momentum_score,
      consistencyScore: state.profile.consistency_score,
    });
    xpEarned = xp.finalXp;

    sport.played_today = true;
    sport.current_streak += 1;
    sport.longest_streak = Math.max(sport.longest_streak, sport.current_streak);
    sport.sessions_count += 1;
    sport.total_xp += xpEarned;
    sport.level = levelFromXp(sport.total_xp);
    sport.rank = rankFromLevel(sport.level);

    const overall = state.sports?.find((s) => s.slug === "overall");
    if (overall && sport.slug !== "overall") {
      overall.total_xp += Math.round(xpEarned * 0.5);
      overall.level = levelFromXp(overall.total_xp);
      overall.rank = rankFromLevel(overall.level);
      overall.sessions_count += 1;
    }

    const sportsBranch = state.skills?.find((s) => s.slug === "sports_branch");
    if (sportsBranch) {
      sportsBranch.total_xp += xpEarned;
      sportsBranch.level = levelFromXp(sportsBranch.total_xp);
      sportsBranch.rank = rankFromLevel(sportsBranch.level);
    }

    state.profile.total_xp += xpEarned;
    state.profile.player_level = levelFromXp(state.profile.total_xp);
    playerLevel = state.profile.player_level;

    state.recentXpEvents = [
      {
        id: randomUUID(),
        user_id: sessionUser.id,
        entity_type: "sport",
        entity_id: sportId,
        base_xp: xp.baseXp,
        final_xp: xpEarned,
        streak_multiplier: xp.multipliers.streak,
        combo_multiplier: xp.multipliers.combo,
        consistency_multiplier: xp.multipliers.consistency,
        momentum_multiplier: xp.multipliers.momentum,
        bonus_multiplier: xp.multipliers.bonus,
        reason: `${sport.name} session`,
        metadata: { duration_minutes: durationMinutes },
        created_at: new Date().toISOString(),
      },
      ...state.recentXpEvents,
    ].slice(0, 100);
  });

  return NextResponse.json({
    success: true,
    xpEarned,
    previousLevel,
    playerLevel,
    leveledUp: playerLevel > previousLevel,
  });
}
