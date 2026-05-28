"use client";

import { useMemo, useState } from "react";
import { getCalendarDays } from "@/lib/activity-calendar";
import type { DashboardStats } from "@/types/database";
import { cn } from "@/lib/utils";

const CAT_COLORS = {
  physical: "bg-blue-500",
  mental: "bg-violet-500",
  awareness: "bg-cyan-500",
  vitality: "bg-emerald-500",
};

export function CalendarHeatmap({ stats }: { stats: DashboardStats }) {
  const days = useMemo(() => getCalendarDays(stats, 12), [stats]);
  const [selected, setSelected] = useState<string | null>(null);

  const selectedEntry = selected
    ? days.find((d) => d.date === selected)?.entry
    : null;

  const intensity = (entry: (typeof days)[0]["entry"]) => {
    if (!entry) return 0;
    return Math.max(
      entry.physical,
      entry.mental,
      entry.awareness,
      entry.vitality
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-[3px] flex-wrap max-w-full">
        {days.map((d) => {
          const v = intensity(d.entry);
          const level =
            v >= 0.9 ? 4 : v >= 0.6 ? 3 : v >= 0.3 ? 2 : v > 0 ? 1 : 0;
          return (
            <button
              key={d.date}
              type="button"
              title={d.date}
              onClick={() => setSelected(d.date)}
              className={cn(
                "w-3 h-3 rounded-sm border border-transparent transition-transform hover:scale-125",
                level === 0 && "bg-slate-800",
                level === 1 && "bg-cyan-900/80",
                level === 2 && "bg-cyan-700/80",
                level === 3 && "bg-cyan-500/80",
                level === 4 && "bg-cyan-300 glow-cyan",
                selected === d.date && "ring-1 ring-cyan-300"
              )}
            />
          );
        })}
      </div>

      <div className="flex gap-4 text-[10px] text-cyan-500/50">
        {Object.entries(CAT_COLORS).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1 capitalize">
            <span className={cn("w-2 h-2 rounded-full", c)} />
            {k}
          </span>
        ))}
      </div>

      {selected && (
        <div className="rounded-lg border border-cyan-500/20 p-3 text-sm">
          <p className="text-cyan-300 font-mono mb-2">{selected}</p>
          {selectedEntry ? (
            <div className="space-y-2">
              <p className="text-cyan-500/50 text-xs">
                +{selectedEntry.total_xp} XP · {selectedEntry.habit_ids.length}{" "}
                habits
              </p>
              <ul className="text-xs text-cyan-100/70 space-y-0.5">
                {selectedEntry.habit_ids.map((id) => {
                  const h = stats.habits.find((x) => x.id === id);
                  return <li key={id}>{h?.name ?? id}</li>;
                })}
              </ul>
            </div>
          ) : (
            <p className="text-cyan-500/40 text-xs">No activity logged</p>
          )}
        </div>
      )}
    </div>
  );
}
