import { NextResponse } from "next/server";
import { skipHabitInState } from "@/lib/game-logic";
import { ensureWeekShields } from "@/lib/player-settings";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json();
  const { habitId, reason } = body as {
    habitId: string;
    reason?: "rest" | "sick" | "travel";
  };

  if (!habitId) {
    return NextResponse.json({ error: "habitId required" }, { status: 400 });
  }

  try {
    let result: { success: boolean; shieldsLeft: number; error?: string } = {
      success: false,
      shieldsLeft: 0,
    };
    await withGameState((state) => {
      result = skipHabitInState(
        state,
        habitId,
        reason ?? "rest"
      );
      if (result.success) {
        result.shieldsLeft = ensureWeekShields(state);
      }
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      shieldsLeft: result.shieldsLeft,
    });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
