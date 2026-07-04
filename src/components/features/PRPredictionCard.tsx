"use client";

import { useGameStore } from "@/stores/game-store";
import { estimate1RM } from "@/lib/pr-prediction";

export function PRPredictionCard() {
  const stats = useGameStore((s) => s.stats);
  if (!stats?.workoutLogs?.length) return null;

  const recent = [...stats.workoutLogs]
    .filter((l) => l.weight && l.reps)
    .slice(0, 5);

  if (recent.length === 0) return null;

  const best = recent.reduce((a, b) => {
    const ea = estimate1RM(a.weight!, a.reps!);
    const eb = estimate1RM(b.weight!, b.reps!);
    return ea >= eb ? a : b;
  });

  const est = estimate1RM(best.weight!, best.reps!);

  return (
    <div className="rounded-xl border border-cyan-500/15 p-3">
      <p className="text-[10px] uppercase tracking-widest text-cyan-500/40">Est. 1RM</p>
      <p className="text-2xl font-mono font-bold text-cyan-300">{est} <span className="text-sm text-cyan-500/50">kg</span></p>
      <p className="text-[10px] text-cyan-500/40 mt-1">from {best.exercise_name} {best.weight}×{best.reps}</p>
    </div>
  );
}
