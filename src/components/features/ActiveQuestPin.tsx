"use client";

import { QuestPanel } from "@/components/features/QuestPanel";
import { getPinnedQuestId } from "@/lib/player-settings";
import type { DashboardStats, Quest } from "@/types/database";
import { Pin, PinOff } from "lucide-react";
import { jarvisFetch } from "@/lib/api-client";

export function ActiveQuestPin({
  stats,
  onUpdate,
}: {
  stats: DashboardStats;
  onUpdate: () => void;
}) {
  const pinnedId = getPinnedQuestId(stats);
  const active = stats.quests.filter((q) => q.status === "active");
  const pinned =
    active.find((q) => q.id === pinnedId) ?? active.find((q) => q.quest_type === "daily");

  const togglePin = async (q: Quest) => {
    const next = pinnedId === q.id ? null : q.id;
    await jarvisFetch("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify({ pinnedQuestId: next }),
    });
    onUpdate();
  };

  if (!pinned) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-500/50">
          Active quest
        </p>
        <button
          type="button"
          onClick={() => void togglePin(pinned)}
          className="text-cyan-500/50 hover:text-cyan-300"
        >
          {pinnedId === pinned.id ? (
            <PinOff className="w-4 h-4" />
          ) : (
            <Pin className="w-4 h-4" />
          )}
        </button>
      </div>
      <QuestPanel quests={[pinned]} />
    </div>
  );
}
