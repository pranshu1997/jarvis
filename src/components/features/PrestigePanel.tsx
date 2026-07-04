"use client";

import { useGameStore } from "@/stores/game-store";
import { getExtended } from "@/lib/player-settings-extended";
import { getBossRushState } from "@/lib/boss-rush";
import { getCurrentMainQuestChapter } from "@/lib/main-quest";

export function PrestigePanel() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  const ext = getExtended(stats.profile);
  const rush = getBossRushState(stats);
  const chapter = getCurrentMainQuestChapter(stats);
  const unlocked = Object.keys(ext.achievements_unlocked ?? {}).length;

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
      <p className="text-xs uppercase tracking-widest text-amber-400/60">Hunter Prestige</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-cyan-500/50 text-[10px]">Main Quest</p>
          <p className="font-mono text-cyan-200">Ch. {chapter}</p>
        </div>
        <div>
          <p className="text-cyan-500/50 text-[10px]">Achievements</p>
          <p className="font-mono text-cyan-200">{unlocked}</p>
        </div>
        <div>
          <p className="text-cyan-500/50 text-[10px]">Boss Rushes</p>
          <p className="font-mono text-cyan-200">{rush.totalWins}</p>
        </div>
        <div>
          <p className="text-cyan-500/50 text-[10px]">Resilience</p>
          <p className="font-mono text-cyan-200">{ext.resilience_score ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
