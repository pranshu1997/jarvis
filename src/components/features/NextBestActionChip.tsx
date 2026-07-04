"use client";

import { useGameStore } from "@/stores/game-store";

export function NextBestActionChip() {
  const action = useGameStore((s) => (s.stats?.meta as { nextBestAction?: { label: string } } | undefined)?.nextBestAction);
  if (!action) return null;

  return (
    <div className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs text-cyan-200">
      <span className="text-cyan-500/50 mr-1">→</span>{action.label}
    </div>
  );
}
