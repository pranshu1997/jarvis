import { NextResponse } from "next/server";
import { completeHabitInState, type CompleteHabitResult } from "@/lib/game-logic";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json();
  const { habitId, completed = true } = body as {
    habitId: string;
    completed?: boolean;
  };

  if (!habitId) {
    return NextResponse.json({ error: "habitId required" }, { status: 400 });
  }

  try {
    if (!completed) {
      await withGameState((state) => {
        const habit = state.habits.find((h) => h.id === habitId);
        if (habit?.completed_today) habit.completed_today = false;
      });
      return NextResponse.json({ success: true, xpEarned: 0 });
    }

    const completion = { result: null as CompleteHabitResult | null };
    await withGameState((state) => {
      completion.result = completeHabitInState(state, habitId, state.profile.id);
    });

    const result = completion.result;
    if (!result) {
      return NextResponse.json({ success: true, xpEarned: 0, alreadyDone: true });
    }

    return NextResponse.json({
      success: true,
      xpEarned: result.xpEarned,
      multipliers: result.multipliers,
      playerLevel: result.playerLevel,
      previousLevel: result.previousLevel,
      previousRank: result.previousRank,
      newRank: result.newRank,
      leveledUp: result.playerLevel > result.previousLevel,
      categoryComplete: result.categoryComplete,
      perfectDay: result.perfectDay,
      comboCount: result.comboCount,
    });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
