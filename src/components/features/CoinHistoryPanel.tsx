"use client";

import { useGameStore } from "@/stores/game-store";

export function CoinHistoryPanel() {
  const history = useGameStore((s) => (s.stats?.meta as { coinHistory?: { at: string; delta: number; reason: string }[] })?.coinHistory) ?? [];
  if (history.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-500/15 p-3 space-y-1.5">
      <p className="text-[10px] uppercase tracking-widest text-amber-500/50">Recent coins</p>
      {history.slice().reverse().map((e, i) => (
        <div key={i} className="flex justify-between text-xs">
          <span className="text-cyan-400/70 truncate mr-2">{e.reason}</span>
          <span className={`font-mono shrink-0 ${e.delta >= 0 ? "text-amber-400" : "text-red-400"}`}>
            {e.delta >= 0 ? "+" : ""}{e.delta}
          </span>
        </div>
      ))}
    </div>
  );
}
