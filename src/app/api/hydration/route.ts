import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { logWater, getTodayWaterMl, WATER_GOAL_ML } from "@/lib/hydration";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  const body = await request.json().catch(() => ({})) as { ml?: number };
  const ml = Number(body.ml) || 250;

  try {
    const holder = { total: 0 };
    await withGameState((state) => {
      holder.total = logWater(state, ml);
    });
    return NextResponse.json({ success: true, todayMl: holder.total, goalMl: WATER_GOAL_ML });
  } catch (e) {
    if (e instanceof GameAuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}

export async function GET() {
  if (!isLocalAuthMode()) return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  try {
    const holder = { total: 0 };
    await withGameState((state) => {
      holder.total = getTodayWaterMl(state);
    });
    return NextResponse.json({ todayMl: holder.total, goalMl: WATER_GOAL_ML });
  } catch (e) {
    if (e instanceof GameAuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}
