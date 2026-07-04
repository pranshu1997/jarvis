import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { recordAppOpen } from "@/lib/app-open-streak";

export async function POST() {
  if (!isLocalAuthMode()) return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  try {
    const holder = { streak: 0, isNew: false };
    await withGameState((state) => {
      const r = recordAppOpen(state);
      holder.streak = r.streak;
      holder.isNew = r.isNew;
    });
    return NextResponse.json(holder);
  } catch (e) {
    if (e instanceof GameAuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}
