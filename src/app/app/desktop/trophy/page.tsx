"use client";

import { AchievementsPanel } from "@/components/features/AchievementsPanel";
import { AchievementHintsPanel } from "@/components/features/AchievementHintsPanel";
import { useGameStore } from "@/stores/game-store";
import { useDashboard } from "@/hooks/useDashboard";
import { getExtended } from "@/lib/player-settings-extended";

export default function TrophyRoomPage() {
  const stats = useGameStore((s) => s.stats);
  useDashboard();

  if (!stats) return null;

  const achievements = stats.meta?.achievements ?? [];
  const resilience = getExtended(stats.profile).resilience_score ?? 0;

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <header>
        <h1 className="font-display text-3xl font-bold text-cyan-100">Trophy Room</h1>
        <p className="text-cyan-500/50 mt-1">
          Resilience score: {resilience} · Phoenix recoveries &amp; milestones
        </p>
      </header>
      <AchievementHintsPanel />
      <AchievementsPanel achievements={achievements} />
    </div>
  );
}
