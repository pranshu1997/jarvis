"use client";

import { useGameStore } from "@/stores/game-store";
import { Target } from "lucide-react";

export function AchievementHintsPanel() {
  const hints = useGameStore((s) => (s.stats?.meta as {
    achievementHints?: { id: string; title: string; hint: string; percent: number }[];
  })?.achievementHints) ?? [];
  if (hints.length === 0) return null;

  return (
    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-purple-400/60 flex items-center gap-1">
        <Target className="w-3 h-3" /> Almost unlocked
      </p>
      {hints.map((h) => (
        <div key={h.id}>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-purple-100">{h.title}</span>
            <span className="font-mono text-purple-400/70">{h.percent}%</span>
          </div>
          <div className="h-1 rounded-full bg-purple-950 overflow-hidden">
            <div className="h-full bg-purple-400" style={{ width: `${h.percent}%` }} />
          </div>
          <p className="text-[10px] text-purple-400/50 mt-0.5">{h.hint}</p>
        </div>
      ))}
    </div>
  );
}
