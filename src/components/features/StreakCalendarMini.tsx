"use client";

import { useGameStore } from "@/stores/game-store";
import { getStreakCalendarDays } from "@/lib/streak-milestones";

export function StreakCalendarMini() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  const days = getStreakCalendarDays(stats, 14);

  return (
    <div className="rounded-xl border border-cyan-500/15 p-3">
      <p className="text-[10px] uppercase tracking-widest text-cyan-500/40 mb-2">14-day activity</p>
      <div className="flex gap-1">
        {days.map((d) => (
          <div
            key={d.date}
            title={d.date}
            className={`flex-1 h-6 rounded-sm ${d.completed ? "bg-cyan-500/60" : "bg-cyan-950/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
