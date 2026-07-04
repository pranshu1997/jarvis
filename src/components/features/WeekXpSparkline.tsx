"use client";

import { useGameStore } from "@/stores/game-store";

export function WeekXpSparkline() {
  const data = useGameStore(
    (s) => (s.stats?.meta as { weekXpSparkline?: { day: string; xp: number }[] })?.weekXpSparkline
  ) ?? [];
  if (data.every((d) => d.xp === 0)) return null;

  const max = Math.max(...data.map((d) => d.xp), 1);

  return (
    <div className="px-4 pb-3">
      <p className="text-[9px] uppercase tracking-widest text-cyan-500/30 mb-2">7-day XP</p>
      <div className="flex items-end gap-1 h-8">
        {data.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className="w-full bg-cyan-500/40 rounded-sm min-h-[2px] transition-all"
              style={{ height: `${Math.max(4, (d.xp / max) * 32)}px` }}
              title={`${d.day}: +${d.xp} XP`}
            />
            <span className="text-[8px] text-cyan-500/30">{d.day.slice(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
