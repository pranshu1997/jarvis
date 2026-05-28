import { NextResponse } from "next/server";
import { adjustHabitValue, type CompleteHabitResult } from "@/lib/game-logic";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json();
  const { habitId, delta } = body as { habitId: string; delta: number };

  if (!habitId || delta == null || delta === 0) {
    return NextResponse.json({ error: "habitId and non-zero delta required" }, { status: 400 });
  }

  try {
    const completion = { result: null as CompleteHabitResult | null };
    let currentValue = 0;

    await withGameState((state) => {
      const habit = state.habits.find((h) => h.id === habitId);
      completion.result = adjustHabitValue(
        state,
        habitId,
        delta,
        state.profile.id
      );
      if (habit) {
        currentValue =
          (habit.metadata as { current_value?: number }).current_value ?? 0;
      }
    });

    const result = completion.result;

    return NextResponse.json({
      success: true,
      currentValue,
      xpEarned: result?.xpEarned ?? 0,
      leveledUp:
        result && result.playerLevel > result.previousLevel
          ? result.playerLevel
          : undefined,
      completed: !!(result && result.xpEarned > 0),
      uncompleted: !!(result && "uncompleted" in result && result.uncompleted),
    });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
