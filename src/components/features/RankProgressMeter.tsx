"use client";

import { useGameStore } from "@/stores/game-store";
import { RankBadge } from "@/components/shared/RankBadge";

export function RankProgressMeter() {
  const rp = useGameStore((s) => (s.stats?.meta as {
    rankProgress?: { currentRank: string; nextRank: string | null; levelsToNext: number; percentToNext: number };
  })?.rankProgress);
  if (!rp?.nextRank) return null;

  return (
    <div className="rounded-xl border border-cyan-500/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-cyan-500/50">Rank ascent</p>
        <div className="flex items-center gap-1.5">
          <RankBadge rank={rp.currentRank as import("@/types/database").RankTier} size="sm" />
          <span className="text-cyan-500/30">→</span>
          <RankBadge rank={rp.nextRank as import("@/types/database").RankTier} size="sm" />
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-cyan-950 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all" style={{ width: `${rp.percentToNext}%` }} />
      </div>
      <p className="text-[10px] text-cyan-500/40 font-mono">{rp.levelsToNext} levels to {rp.nextRank}-Rank</p>
    </div>
  );
}
