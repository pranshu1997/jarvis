import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { setDailyWin } from "@/lib/daily-win";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  const body = await request.json().catch(() => ({})) as { win?: string };
  if (!body.win?.trim()) return NextResponse.json({ error: "win required" }, { status: 400 });

  try {
    await withGameState((state) => {
      setDailyWin(state, body.win!.trim());
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}
