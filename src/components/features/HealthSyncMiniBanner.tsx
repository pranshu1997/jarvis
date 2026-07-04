"use client";

import { useGameStore } from "@/stores/game-store";
import { Activity, Moon, Heart } from "lucide-react";

export function HealthSyncMiniBanner() {
  const health = useGameStore(
    (s) => (s.stats?.meta as {
      healthSummary?: { steps?: number; sleep_hours?: number; hrv?: number };
    })?.healthSummary
  );
  if (!health || (!health.steps && !health.sleep_hours && !health.hrv)) return null;

  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 flex flex-wrap gap-4 text-[10px] font-mono text-emerald-300">
      {health.steps != null && (
        <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{health.steps.toLocaleString()} steps</span>
      )}
      {health.sleep_hours != null && (
        <span className="flex items-center gap-1"><Moon className="w-3 h-3" />{health.sleep_hours}h sleep</span>
      )}
      {health.hrv != null && (
        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />HRV {health.hrv}</span>
      )}
    </div>
  );
}
