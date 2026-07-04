"use client";

import { useState } from "react";
import type { Quest } from "@/types/database";
import { jarvisFetch } from "@/lib/api-client";
import { Pin, PinOff } from "lucide-react";

export function PinQuestMobile({ quests }: { quests: Quest[] }) {
  const [pinned, setPinned] = useState<string | null>(null);
  const active = quests.filter((q) => q.status === "active");

  const toggle = async (questId: string) => {
    const next = pinned === questId ? null : questId;
    await jarvisFetch("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify({ pinnedQuestId: next }),
    });
    setPinned(next);
  };

  if (active.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {active.slice(0, 4).map((q) => (
        <button
          key={q.id}
          type="button"
          onClick={() => toggle(q.id)}
          className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs border ${
            pinned === q.id ? "border-cyan-400 bg-cyan-500/10 text-cyan-200" : "border-cyan-500/20 text-cyan-500/60"
          }`}
        >
          {pinned === q.id ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3 opacity-40" />}
          {q.title.slice(0, 20)}
        </button>
      ))}
    </div>
  );
}
