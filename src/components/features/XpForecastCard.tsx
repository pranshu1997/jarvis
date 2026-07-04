"use client";

import { useGameStore } from "@/stores/game-store";
import { Zap } from "lucide-react";

export function XpForecastCard() {
  const forecast = useGameStore(
    (s) => (s.stats?.meta as {
      xpForecast?: { earnedToday: number; remainingXp: number; potentialTotal: number; incompleteCount: number };
    })?.xpForecast
  );
  if (!forecast || forecast.incompleteCount === 0) return null;

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
      <p className="text-[10px] uppercase tracking-widest text-amber-500/50 flex items-center gap-1 mb-1">
        <Zap className="w-3 h-3" /> XP forecast
      </p>
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-mono text-amber-300">+{forecast.remainingXp}</span>
        <span className="text-[10px] text-cyan-500/50">{forecast.incompleteCount} habits left</span>
      </div>
      <p className="text-[10px] text-cyan-500/40 mt-1">
        {forecast.earnedToday} earned · {forecast.potentialTotal} potential today
      </p>
    </div>
  );
}
