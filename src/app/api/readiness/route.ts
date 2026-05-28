import { NextResponse } from "next/server";
import { logReadiness } from "@/lib/readiness";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json();
  const sleep = Number(body.sleep);
  const energy = Number(body.energy);
  const soreness = Number(body.soreness);

  if (!sleep || !energy || !soreness) {
    return NextResponse.json({ error: "sleep, energy, soreness (1-5) required" }, { status: 400 });
  }

  try {
    let entry = null;
    await withGameState((state) => {
      entry = logReadiness(
        state,
        Math.min(5, Math.max(1, sleep)),
        Math.min(5, Math.max(1, energy)),
        Math.min(5, Math.max(1, soreness))
      );
    });
    return NextResponse.json({ success: true, entry });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
