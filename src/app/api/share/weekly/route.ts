import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { buildWeeklyShareSvg } from "@/lib/share-weekly";

export async function GET() {
  if (!isLocalAuthMode()) return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  try {
    const holder = { svg: "" };
    await withGameState((state) => {
      holder.svg = buildWeeklyShareSvg(state);
    });
    return new NextResponse(holder.svg, { headers: { "Content-Type": "image/svg+xml" } });
  } catch (e) {
    if (e instanceof GameAuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}
