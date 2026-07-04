import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getExpiringQuests } from "@/lib/quest-expiry";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { quests: [] as ReturnType<typeof getExpiringQuests> };
    await withGameState((state) => {
      holder.quests = getExpiringQuests(state, 72);
    });
    return NextResponse.json({ expiring: holder.quests });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
