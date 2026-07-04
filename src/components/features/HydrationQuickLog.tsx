"use client";

import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { useGameStore } from "@/stores/game-store";
import { Droplets } from "lucide-react";

const PRESETS = [
  { label: "+250ml", ml: 250 },
  { label: "+500ml", ml: 500 },
  { label: "+1L", ml: 1000 },
];

export function HydrationQuickLog() {
  const { refetch } = useDashboard();
  const todayMl = useGameStore((s) => (s.stats?.meta as { waterTodayMl?: number; waterGoalMl?: number })?.waterTodayMl) ?? 0;
  const goalMl = useGameStore((s) => (s.stats?.meta as { waterGoalMl?: number })?.waterGoalMl) ?? 2500;
  const pct = Math.min(100, Math.round((todayMl / goalMl) * 100));

  const log = async (ml: number) => {
    await jarvisFetch("/api/hydration", { method: "POST", body: JSON.stringify({ ml }) });
    refetch();
  };

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-blue-400/60 flex items-center gap-1">
          <Droplets className="w-3 h-3" /> Hydration
        </p>
        <span className="text-[10px] font-mono text-blue-300">{todayMl}/{goalMl}ml</span>
      </div>
      <div className="h-1 rounded-full bg-blue-950 overflow-hidden">
        <div className="h-full bg-blue-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => void log(p.ml)}
            className="text-[10px] px-2.5 py-1 rounded-full border border-blue-500/25 text-blue-300 hover:bg-blue-500/10"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
