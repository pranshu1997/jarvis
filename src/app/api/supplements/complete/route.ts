import { NextResponse } from "next/server";
import { calculateXp, levelFromXp } from "@/lib/xp-engine";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { syncPlayerScores } from "@/lib/game-logic";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json();
  const { supplementId, taken = true } = body as {
    supplementId: string;
    taken?: boolean;
  };

  let xpEarned = 0;
  let previousLevel = 0;
  let playerLevel = 0;

  try {
  await withGameState((state) => {
    const sup = state.supplements.find((s) => s.id === supplementId);
    if (!sup) return;

    previousLevel = state.profile.player_level;

    if (taken && !sup.taken_today) {
      const xp = calculateXp({
        baseXp: sup.base_xp,
        streakDays: sup.current_streak,
        momentumScore: state.profile.momentum_score,
        consistencyScore: state.profile.consistency_score,
      });
      sup.taken_today = true;
      sup.current_streak += 1;
      sup.total_xp += xp.finalXp;
      sup.level = levelFromXp(sup.total_xp);
      state.profile.total_xp += xp.finalXp;
      state.profile.player_level = levelFromXp(state.profile.total_xp);
      xpEarned = xp.finalXp;

      state.recentXpEvents = [
        {
          id: randomUUID(),
          user_id: state.profile.id,
          entity_type: "supplement",
          entity_id: supplementId,
          base_xp: xp.baseXp,
          final_xp: xp.finalXp,
          streak_multiplier: xp.multipliers.streak,
          combo_multiplier: xp.multipliers.combo,
          consistency_multiplier: xp.multipliers.consistency,
          momentum_multiplier: xp.multipliers.momentum,
          bonus_multiplier: xp.multipliers.bonus,
          reason: `${sup.name} taken`,
          metadata: {},
          created_at: new Date().toISOString(),
        },
        ...state.recentXpEvents,
      ].slice(0, 100);

      if (state.dailyCompletion) {
        state.dailyCompletion.total_xp += xp.finalXp;
      }
    } else if (!taken) {
      sup.taken_today = false;
    }

    syncPlayerScores(state);
    playerLevel = state.profile.player_level;
  });

  return NextResponse.json({
    success: true,
    xpEarned,
    previousLevel,
    playerLevel,
    leveledUp: playerLevel > previousLevel,
  });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
