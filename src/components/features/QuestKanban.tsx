"use client";

import type { Quest } from "@/types/database";

interface Props {
  quests: Quest[];
}

export function QuestKanban({ quests }: Props) {
  const columns = [
    { key: "daily", label: "Daily", filter: (q: Quest) => q.quest_type === "daily" && q.status === "active" },
    { key: "weekly", label: "Weekly", filter: (q: Quest) => q.quest_type === "weekly" && q.status === "active" },
    { key: "dungeon", label: "Dungeon", filter: (q: Quest) => q.quest_type === "dungeon" && q.status === "active" },
    { key: "done", label: "Done", filter: (q: Quest) => q.status === "completed" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {columns.map(({ key, label, filter }) => {
        const items = quests.filter(filter);
        return (
          <div key={key} className="rounded-xl border border-cyan-500/15 bg-cyan-950/20 p-3 min-h-[120px]">
            <p className="text-xs uppercase tracking-widest text-cyan-500/50 mb-2">{label} ({items.length})</p>
            <div className="space-y-2">
              {items.map((q) => (
                <div key={q.id} className="rounded-lg bg-cyan-950/40 px-2 py-1.5">
                  <p className="text-xs font-medium text-cyan-100 truncate">{q.title}</p>
                  <p className="text-[10px] text-cyan-500/40">{q.current_count}/{q.target_count}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
