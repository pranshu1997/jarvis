"use client";

import { PlayerHeader } from "@/components/features/PlayerHeader";
import { RankBadge } from "@/components/shared/RankBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/stores/game-store";
import { formatNumber } from "@/lib/utils";
import { EvolutionGoalPanel } from "@/components/features/EvolutionGoalPanel";
import { AppOpenStreakBadge } from "@/components/features/AppOpenStreakBadge";
import { ProfileTitlePicker } from "@/components/features/ProfileTitlePicker";
import { ResilienceBadge } from "@/components/features/ResilienceBadge";
export default function DesktopProfilePage() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <PlayerHeader profile={stats.profile} />
      <div className="flex items-center gap-2">
        <AppOpenStreakBadge />
        <ResilienceBadge />
      </div>
      <ProfileTitlePicker />
      <EvolutionGoalPanel />

      <div className="grid grid-cols-2 gap-6">
        <Card glow>
          <CardHeader>
            <CardTitle>Hunter Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-cyan-500/50">Total XP</span>
              <span className="font-mono text-cyan-300">
                {formatNumber(stats.profile.total_xp)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-500/50">Player Level</span>
              <span className="font-mono text-cyan-300">
                {stats.profile.player_level}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-500/50">Rank</span>
              <RankBadge rank={stats.profile.rank} />
            </div>
          </CardContent>
        </Card>

        <Card glow>
          <CardHeader>
            <CardTitle>Core Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Power Score", value: stats.profile.power_score },
              { label: "Discipline Score", value: stats.profile.discipline_score },
              { label: "Momentum Score", value: stats.profile.momentum_score },
              { label: "Consistency Score", value: stats.profile.consistency_score },
            ].map((s) => (
              <div key={s.label} className="flex justify-between">
                <span className="text-cyan-500/50">{s.label}</span>
                <span className="font-mono text-cyan-300">{s.value}/100</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
