import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getEvolutionGoal, getGoalProgress, setEvolutionGoal } from "@/lib/evolution-goal";
import type { RankTier } from "@/types/database";

export async function GET() {
  if (!isLocalAuthMode()) return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  try {
    const holder = { goal: null as ReturnType<typeof getEvolutionGoal>, progress: null as ReturnType<typeof getGoalProgress> };
    await withGameState((state) => {
      holder.goal = getEvolutionGoal(state);
      holder.progress = getGoalProgress(state);
    });
    return NextResponse.json({ goal: holder.goal, progress: holder.progress });
  } catch (e) {
    if (e instanceof GameAuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}

export async function POST(request: Request) {
  if (!isLocalAuthMode()) return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  const body = await request.json().catch(() => ({})) as { targetRank?: RankTier; targetDate?: string };
  if (!body.targetRank || !body.targetDate) {
    return NextResponse.json({ error: "targetRank and targetDate required" }, { status: 400 });
  }
  try {
    await withGameState((state) => {
      setEvolutionGoal(state, body.targetRank!, body.targetDate!);
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}
