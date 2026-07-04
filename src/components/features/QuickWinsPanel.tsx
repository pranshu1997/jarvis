"use client";

import { useGameStore } from "@/stores/game-store";
import { useDashboard } from "@/hooks/useDashboard";
import { Zap } from "lucide-react";

export function QuickWinsPanel() {
  const { completeHabit } = useDashboard();
  const wins = useGameStore((s) => (s.stats?.meta as { quickWins?: { id: string; name: string }[] })?.quickWins) ?? [];
  if (wins.length === 0) return null;

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-emerald-400/70 flex items-center gap-1">
        <Zap className="w-3 h-3" /> Quick wins
      </p>
      {wins.map((h) => (
        <button
          key={h.id}
          type="button"
          onClick={() => void completeHabit(h.id, true)}
          className="w-full text-left text-xs px-2 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-200 hover:bg-emerald-500/10"
        >
          {h.name}
        </button>
      ))}
    </div>
  );
}
