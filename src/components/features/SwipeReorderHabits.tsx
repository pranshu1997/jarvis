"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { getHabitSortOrder, sortHabitsByUserOrder } from "@/lib/player-settings-extended";
import { jarvisFetch } from "@/lib/api-client";
import { GripVertical } from "lucide-react";

export function SwipeReorderHabits() {
  const { stats, refetch } = useDashboard();
  const [dragId, setDragId] = useState<string | null>(null);

  if (!stats) return null;

  const order = getHabitSortOrder(stats);
  const habits = sortHabitsByUserOrder(stats.habits.filter((h) => h.is_active), order);

  const saveOrder = async (ids: string[]) => {
    await jarvisFetch("/api/habits/reorder", {
      method: "POST",
      body: JSON.stringify({ habitIds: ids }),
    });
    refetch();
  };

  const move = (fromIdx: number, toIdx: number) => {
    const ids = habits.map((h) => h.id);
    const [removed] = ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, removed!);
    void saveOrder(ids);
  };

  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-widest text-cyan-500/40 mb-2">Long-press ↑↓ to reorder</p>
      {habits.map((h, i) => (
        <div
          key={h.id}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
            dragId === h.id ? "border-cyan-400 bg-cyan-500/10" : "border-cyan-500/10"
          }`}
          onTouchStart={() => setDragId(h.id)}
          onTouchEnd={() => setDragId(null)}
        >
          <GripVertical className="w-4 h-4 text-cyan-500/30 shrink-0" />
          <span className="text-sm text-cyan-100 flex-1 truncate">{h.name}</span>
          <div className="flex gap-1">
            {i > 0 && (
              <button type="button" onClick={() => move(i, i - 1)} className="text-cyan-500/50 text-xs px-1">↑</button>
            )}
            {i < habits.length - 1 && (
              <button type="button" onClick={() => move(i, i + 1)} className="text-cyan-500/50 text-xs px-1">↓</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
