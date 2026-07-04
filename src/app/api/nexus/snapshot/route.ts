import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { ensureWeekShields } from "@/lib/player-settings";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    let snapshot = {
      rank: "E",
      level: 1,
      totalXp: 0,
      completionPct: 0,
      topStreak: 0,
      shadowCoins: 0,
      shieldsRemaining: 0,
      displayName: "Hunter",
    };

    await withGameState((state) => {
      const total = state.habits.filter((h) => h.is_active).length;
      const done = state.habits.filter((h) => h.is_active && h.completed_today).length;
      const topStreak = Math.max(
        0,
        ...state.habits.filter((h) => h.is_active).map((h) => h.current_streak)
      );
      snapshot = {
        rank: state.profile.rank,
        level: state.profile.player_level,
        totalXp: state.profile.total_xp,
        completionPct: total ? Math.round((done / total) * 100) : 0,
        topStreak,
        shadowCoins: state.meta?.shadowCoins ?? 0,
        shieldsRemaining: ensureWeekShields(state),
        displayName: state.profile.display_name ?? "Hunter",
      };
    });

    return NextResponse.json(snapshot);
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
