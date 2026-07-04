"use client";

import { AchievementsPanel } from "@/components/features/AchievementsPanel";
import { AchievementProgressBars } from "@/components/features/AchievementProgressBars";
import { PrestigePanel } from "@/components/features/PrestigePanel";
import { useGameStore } from "@/stores/game-store";
import { useDashboard } from "@/hooks/useDashboard";
import { getExtended } from "@/lib/player-settings-extended";
import { Trophy } from "lucide-react";

export default function MobileTrophyPage() {
  const stats = useGameStore((s) => s.stats);
  useDashboard();

  if (!stats) return null;

  const achievements = stats.meta?.achievements ?? [];
  const resilience = getExtended(stats.profile).resilience_score ?? 0;

  return (
    <div className="space-y-6 pt-4">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-cyan-100">Trophy Room</h1>
          <p className="text-[11px] text-cyan-500/50">
            Resilience {resilience} · Phoenix recoveries &amp; milestones
          </p>
        </div>
      </header>
      <AchievementProgressBars />
      <PrestigePanel />
      <AchievementsPanel achievements={achievements} />
    </div>
  );
}
