import { NextResponse } from "next/server";
import { getPriorityHabit } from "@/lib/mission-brief";
import { getTodayReadiness } from "@/lib/readiness";
import { getShadowCoins } from "@/lib/player-settings-extended";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    let payload = {};
    await withGameState((state) => {
      const dc = state.dailyCompletion;
      const total = dc?.total_habits ?? 0;
      const done = dc?.completed_habits ?? 0;
      const priority = getPriorityHabit(state);
      payload = {
        completionPercent: total ? Math.round((done / total) * 100) : 0,
        completedHabits: done,
        totalHabits: total,
        playerLevel: state.profile.player_level,
        rank: state.profile.rank,
        shadowCoins: getShadowCoins(state),
        readiness: getTodayReadiness(state),
        priorityHabit: priority
          ? { id: priority.id, name: priority.name }
          : null,
        topStreak: Math.max(0, ...state.habits.map((h) => h.current_streak)),
      };
    });
    return NextResponse.json(payload);
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
