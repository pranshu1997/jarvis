import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getEligiblePerks, claimRankPerk, RANK_PERKS } from "@/lib/rank-perks";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { eligible: [] as typeof RANK_PERKS };
    await withGameState((state) => {
      holder.eligible = getEligiblePerks(state);
    });
    return NextResponse.json({ perks: RANK_PERKS, eligible: holder.eligible });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as { perkId?: string };
  if (!body.perkId) {
    return NextResponse.json({ error: "perkId required" }, { status: 400 });
  }

  try {
    const holder = { ok: false };
    await withGameState((state) => {
      holder.ok = claimRankPerk(state, body.perkId!);
    });
    if (!holder.ok) {
      return NextResponse.json({ error: "Cannot claim perk" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
