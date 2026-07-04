"use client";

import { useGameStore } from "@/stores/game-store";

export function CategoryBalanceChip() {
  const balance = useGameStore((s) => (s.stats?.meta as { categoryBalance?: Record<string, number> })?.categoryBalance);
  if (!balance) return null;

  const entries = Object.entries(balance).sort((a, b) => a[1] - b[1]);
  const weakest = entries[0];
  if (!weakest) return null;

  return (
    <div className="inline-flex flex-wrap gap-2 text-[10px] font-mono">
      {entries.map(([cat, pct]) => (
        <span
          key={cat}
          className={`px-2 py-0.5 rounded-full border ${
            cat === weakest[0]
              ? "border-amber-500/30 text-amber-300 bg-amber-500/10"
              : "border-cyan-500/15 text-cyan-500/50"
          }`}
        >
          {cat} {pct}%
        </span>
      ))}
    </div>
  );
}
