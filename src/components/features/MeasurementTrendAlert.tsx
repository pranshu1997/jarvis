"use client";

import { useGameStore } from "@/stores/game-store";
import { getExtended } from "@/lib/player-settings-extended";
import { computeBodyCompScore } from "@/lib/body-comp-score";
import { TrendingDown, TrendingUp } from "lucide-react";

export function MeasurementTrendAlert() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  const measurements = getExtended(stats.profile).body_measurements ?? [];
  const { trend, waistDelta, score } = computeBodyCompScore(measurements);

  if (measurements.length < 2) return null;

  const positive = waistDelta != null && waistDelta > 0;

  return (
    <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${positive ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"}`}>
      {positive ? <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
      <div>
        <p className="text-sm font-medium text-cyan-100">Body Score: {score}/100</p>
        <p className="text-xs text-cyan-500/60 mt-0.5">{trend}</p>
      </div>
    </div>
  );
}
