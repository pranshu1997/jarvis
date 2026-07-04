"use client";

import { useGameStore } from "@/stores/game-store";
import { useDashboard } from "@/hooks/useDashboard";
import { Flame } from "lucide-react";

export function AtRiskHabitsPanel() {
  const { completeHabit } = useDashboard();
  const atRisk = useGameStore(
    (s) => (s.stats?.meta as { atRiskList?: { habit: { id: string; name: string; current_streak: number }; reason: string }[] })?.atRiskList
  ) ?? [];

  if (atRisk.length === 0) return null;

  return (
    <div className="rounded-xl border border-orange-500/25 bg-orange-500/10 p-4 space-y-2">
      <p className="text-xs uppercase tracking-widest text-orange-400/70 flex items-center gap-1">
        <Flame className="w-3.5 h-3.5" /> Streaks at risk
      </p>
      {atRisk.map(({ habit, reason }) => (
        <div key={habit.id} className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-orange-100 truncate">{habit.name}</p>
            <p className="text-[10px] text-orange-400/60">{reason} · {habit.current_streak}d</p>
          </div>
          <button
            type="button"
            onClick={() => void completeHabit(habit.id, true)}
            className="shrink-0 text-[10px] px-2.5 py-1 rounded-full border border-orange-400/40 text-orange-300 hover:bg-orange-500/20"
          >
            Complete
          </button>
        </div>
      ))}
    </div>
  );
}
