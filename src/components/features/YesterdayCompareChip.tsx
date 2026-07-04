"use client";

import { useGameStore } from "@/stores/game-store";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function YesterdayCompareChip() {
  const cmp = useGameStore(
    (s) => (s.stats?.meta as { yesterdayCompare?: { delta: number; todayXp: number; yesterdayXp: number } })?.yesterdayCompare
  );
  if (!cmp) return null;

  const Icon = cmp.delta > 0 ? TrendingUp : cmp.delta < 0 ? TrendingDown : Minus;
  const color = cmp.delta > 0 ? "text-emerald-400" : cmp.delta < 0 ? "text-red-400" : "text-cyan-500/50";

  return (
    <div className="inline-flex items-center gap-1.5 text-[10px] font-mono border border-cyan-500/20 rounded-full px-3 py-1 text-cyan-400/80">
      <Icon className={`w-3 h-3 ${color}`} />
      <span>{cmp.todayXp} XP today</span>
      <span className="text-cyan-500/30">·</span>
      <span className={color}>
        {cmp.delta >= 0 ? "+" : ""}{cmp.delta} vs yesterday
      </span>
    </div>
  );
}
