import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { categoryBalance } from "@/lib/analytics-correlation";
import { spawnDungeonFromQuest } from "@/lib/dungeons";

export async function POST() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { quest: null as { id: string; title: string } | null };
    await withGameState((state) => {
      const balance = categoryBalance(state);
      const weakest = Object.entries(balance).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "physical";
      const title = `${weakest.charAt(0).toUpperCase()}${weakest.slice(1)} Gate — Custom Boss`;

      const now = new Date().toISOString();
      const quest = {
        id: randomUUID(),
        user_id: state.profile.id,
        title,
        slug: `dungeon-gen-${weakest}`,
        description: `Coach-generated dungeon targeting your weakest pillar: ${weakest}`,
        quest_type: "dungeon" as const,
        status: "active" as const,
        xp_reward: 300,
        target_count: 5,
        current_count: 0,
        rank_required: null,
        category_id: null,
        is_system: false,
        metadata: { category_slug: weakest, coach_generated: true },
        created_at: now,
        updated_at: now,
        completed_at: null,
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      };
      state.quests.push(quest);
      spawnDungeonFromQuest(state, quest);
      holder.quest = { id: quest.id, title: quest.title };
    });
    return NextResponse.json({ success: true, quest: holder.quest });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
