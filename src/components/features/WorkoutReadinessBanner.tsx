"use client";

import { useGameStore } from "@/stores/game-store";
import { getWorkoutReadinessGate } from "@/lib/workout-readiness";
import { Activity } from "lucide-react";

export function WorkoutReadinessBanner() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  const gate = getWorkoutReadinessGate(stats);
  if (gate.recommendation === "push") return null;

  const isRecover = gate.recommendation === "recover";

  return (
    <div className={`rounded-xl border px-4 py-2.5 flex items-start gap-2 ${
      isRecover ? "border-amber-500/25 bg-amber-500/5" : "border-cyan-500/25 bg-cyan-500/5"
    }`}>
      <Activity className={`w-4 h-4 shrink-0 mt-0.5 ${isRecover ? "text-amber-400" : "text-cyan-400"}`} />
      <div>
        <p className={`text-xs font-medium ${isRecover ? "text-amber-200" : "text-cyan-200"}`}>
          Readiness: {gate.recommendation}
        </p>
        <p className={`text-[10px] ${isRecover ? "text-amber-400/70" : "text-cyan-400/70"}`}>{gate.message}</p>
      </div>
    </div>
  );
}
