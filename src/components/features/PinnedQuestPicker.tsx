"use client";

import { useState } from "react";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { useGameStore } from "@/stores/game-store";
import { Pin } from "lucide-react";

export function PinnedQuestPicker() {
  const { stats, refetch } = useDashboard();
  const pinnedId = useGameStore((s) => (s.stats?.profile.settings as { pinned_quest_id?: string })?.pinned_quest_id);
  const [saving, setSaving] = useState(false);
  if (!stats) return null;

  const active = stats.quests.filter((q) => q.status === "active");

  const pin = async (questId: string) => {
    setSaving(true);
    await jarvisFetch("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify({ pinnedQuestId: questId }),
    });
    setSaving(false);
    refetch();
  };

  if (active.length === 0) return null;

  return (
    <div className="rounded-xl border border-cyan-500/15 p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-cyan-500/50 flex items-center gap-1">
        <Pin className="w-3 h-3" /> Pinned quest
      </p>
      <div className="flex flex-wrap gap-2">
        {active.slice(0, 4).map((q) => (
          <button
            key={q.id}
            type="button"
            disabled={saving}
            onClick={() => void pin(q.id)}
            className={`text-[10px] px-2.5 py-1 rounded-full border truncate max-w-[140px] ${
              pinnedId === q.id
                ? "border-cyan-400 bg-cyan-500/15 text-cyan-200"
                : "border-slate-700 text-cyan-400/60 hover:border-cyan-500/30"
            }`}
          >
            {q.title}
          </button>
        ))}
      </div>
    </div>
  );
}
