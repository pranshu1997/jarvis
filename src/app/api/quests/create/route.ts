import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isLocalAuthMode } from "@/lib/auth/config";
import { getLocalSessionUser } from "@/lib/auth/session";
import { persistUserState } from "@/lib/local/mutations";
import type { Quest, QuestType } from "@/types/database";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const sessionUser = await getLocalSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const title = (body.title as string)?.trim();
  const questType = (body.questType as QuestType) || "side";
  const xpReward = Number(body.xpReward) || 50;
  const targetCount = Number(body.targetCount) || 1;

  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  let quest: Quest | null = null;

  await persistUserState(sessionUser.id, (state) => {
    quest = {
      id: randomUUID(),
      user_id: sessionUser.id,
      slug: `custom-${Date.now().toString(36)}`,
      title,
      description: body.description ?? null,
      quest_type: questType,
      status: "active",
      target_count: targetCount,
      current_count: 0,
      xp_reward: xpReward,
      rank_required: null,
      category_id: null,
      is_system: false,
      expires_at: null,
      completed_at: null,
      metadata: body.metadata ?? {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.quests.push(quest);
  });

  return NextResponse.json({ success: true, quest });
}
