import { NextResponse } from "next/server";
import { syncDailyCompletion } from "@/lib/game-logic";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { todayISO } from "@/lib/utils";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const { habitId, archived = true } = await request.json();

  if (!habitId) {
    return NextResponse.json({ error: "habitId required" }, { status: 400 });
  }

  try {
    await withGameState((state) => {
      const habit = state.habits.find((h) => h.id === habitId);
      if (!habit) throw new Error("Habit not found");
      habit.is_active = !archived;
      habit.metadata = {
        ...(habit.metadata as object),
        archived_at: archived ? todayISO() : undefined,
      };
      if (archived) habit.completed_today = false;
      syncDailyCompletion(state);
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    throw e;
  }
}
