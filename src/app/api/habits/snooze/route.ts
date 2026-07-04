import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { patchExtended } from "@/lib/player-settings-extended";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as { habitId?: string };
  if (!body.habitId) {
    return NextResponse.json({ error: "habitId required" }, { status: 400 });
  }

  try {
    await withGameState((state) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);
      const snooze = (state.profile.settings as { habit_snooze?: Record<string, string> })?.habit_snooze ?? {};
      patchExtended(state.profile, {
        habit_snooze: { ...snooze, [body.habitId!]: tomorrow.toISOString() },
      });
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
