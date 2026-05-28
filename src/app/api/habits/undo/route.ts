import { NextResponse } from "next/server";
import { undoLastAction } from "@/lib/game-logic";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export async function POST() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    let ok = false;
    await withGameState((state) => {
      ok = undoLastAction(state);
    });

    if (!ok) {
      return NextResponse.json(
        { error: "Nothing to undo or window expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
