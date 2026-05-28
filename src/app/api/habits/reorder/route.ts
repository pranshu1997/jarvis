import { NextResponse } from "next/server";
import { patchExtended } from "@/lib/player-settings-extended";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export async function PATCH(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const { habitIds } = await request.json() as { habitIds: string[] };
  if (!Array.isArray(habitIds)) {
    return NextResponse.json({ error: "habitIds array required" }, { status: 400 });
  }

  try {
    await withGameState((state) => {
      patchExtended(state.profile, { habit_sort_order: habitIds });
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
