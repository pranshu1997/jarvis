import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { MONARCH_SKILLS, getSkillLevels, purchaseSkill } from "@/lib/monarch-skills";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { skills: MONARCH_SKILLS, levels: {} as Record<string, number> };
    await withGameState((state) => {
      holder.levels = getSkillLevels(state);
    });
    return NextResponse.json({ skills: holder.skills, levels: holder.levels });
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

  const body = await request.json().catch(() => ({})) as { skillId?: string };
  if (!body.skillId) {
    return NextResponse.json({ error: "skillId required" }, { status: 400 });
  }

  try {
    const holder = { result: { ok: false, error: "Unknown" } as { ok: boolean; error?: string } };
    await withGameState((state) => {
      holder.result = purchaseSkill(state, body.skillId!);
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
