import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getDrillById, SPORT_DRILLS } from "@/lib/sport-drills";
import { calculateXp } from "@/lib/xp-engine";

export async function GET() {
  return NextResponse.json({ drills: SPORT_DRILLS });
}

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as { drillId?: string };
  const drill = body.drillId ? getDrillById(body.drillId) : null;
  if (!drill) {
    return NextResponse.json({ error: "Invalid drillId" }, { status: 400 });
  }

  try {
    const holder = { xpEarned: 0 };
    await withGameState((state) => {
      const xp = calculateXp({
        baseXp: drill.xp_reward,
        streakDays: 0,
        momentumScore: state.profile.momentum_score,
        consistencyScore: state.profile.consistency_score,
      });
      state.profile.total_xp += xp.finalXp;
      holder.xpEarned = xp.finalXp;
    });
    return NextResponse.json({ success: true, xpEarned: holder.xpEarned, drill });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
