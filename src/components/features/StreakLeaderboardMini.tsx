"use client";

import { useGameStore } from "@/stores/game-store";
import { Flame } from "lucide-react";

export function StreakLeaderboardMini() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  const top = [...stats.habits]
    .filter((h) => h.is_active && h.current_streak > 0)
    .sort((a, b) => b.current_streak - a.current_streak)
    .slice(0, 5);
  if (top.length === 0) return null;

  return (
    <div className="rounded-xl border border-orange-500/15 p-3 space-y-1.5">
      <p className="text-[10px] uppercase tracking-widest text-orange-400/60 flex items-center gap-1 mb-1">
        <Flame className="w-3 h-3" /> Top streaks
      </p>
      {top.map((h, i) => (
        <div key={h.id} className="flex justify-between text-xs">
          <span className="text-cyan-200/70 truncate mr-2">{i + 1}. {h.name}</span>
          <span className="font-mono text-orange-400 shrink-0">{h.current_streak}d</span>
        </div>
      ))}
    </div>
  );
}
