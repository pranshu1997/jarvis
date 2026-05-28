import { NextResponse } from "next/server";
import { completeRoutineChain } from "@/lib/routines";
import { addShadowCoins } from "@/lib/player-settings-extended";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const { routineId } = await request.json();
  if (!routineId) {
    return NextResponse.json({ error: "routineId required" }, { status: 400 });
  }

  try {
    let bonusXp = 0;
    await withGameState((state) => {
      const result = completeRoutineChain(state, routineId);
      if (!result) throw new Error("Routine not complete yet");
      bonusXp = result.bonusXp;
      state.profile.total_xp += bonusXp;
      addShadowCoins(state, Math.floor(bonusXp / 5), "Routine bonus");
    });
    return NextResponse.json({ success: true, bonusXp });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }
}
