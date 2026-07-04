import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { habits: [] as { id: string; title: string; archived_at?: string }[] };
    await withGameState((state) => {
      holder.habits = state.habits
        .filter((h) => !h.is_active)
        .map((h) => ({
          id: h.id,
          title: h.name,
          archived_at: (h.metadata as { archived_at?: string })?.archived_at,
        }));
    });
    return NextResponse.json({ habits: holder.habits });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
