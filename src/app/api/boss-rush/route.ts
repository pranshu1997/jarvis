import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { startBossRush, getBossRushState } from "@/lib/boss-rush";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { state: null as ReturnType<typeof getBossRushState> | null };
    await withGameState((state) => {
      holder.state = getBossRushState(state);
    });
    return NextResponse.json(holder.state);
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}

export async function POST() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { result: { ok: false, error: "Unknown" } as { ok: boolean; error?: string } };
    await withGameState((state) => {
      holder.result = startBossRush(state);
    });
    if (!holder.result.ok) {
      return NextResponse.json({ error: holder.result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
