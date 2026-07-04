import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { patchExtended } from "@/lib/player-settings-extended";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as {
    habitId?: string;
    requiresHabitId?: string;
    minStreak?: number;
  };

  if (!body.habitId || !body.requiresHabitId) {
    return NextResponse.json({ error: "habitId and requiresHabitId required" }, { status: 400 });
  }

  try {
    await withGameState((state) => {
      const ext = state.profile.settings ?? {};
      const deps = ((ext as { habit_dependencies?: { habit_id: string; requires_habit_id: string; min_streak: number }[] }).habit_dependencies ?? [])
        .filter((d) => d.habit_id !== body.habitId);
      deps.push({
        habit_id: body.habitId!,
        requires_habit_id: body.requiresHabitId!,
        min_streak: body.minStreak ?? 7,
      });
      patchExtended(state.profile, { habit_dependencies: deps });
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
