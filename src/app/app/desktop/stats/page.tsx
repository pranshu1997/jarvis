"use client";

import { CategoryGrid } from "@/components/features/CategoryGrid";
import { PlayerHeader } from "@/components/features/PlayerHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankBadge } from "@/components/shared/RankBadge";
import { useGameStore } from "@/stores/game-store";
import { RANK_LABELS } from "@/lib/xp-engine";
import type { RankTier } from "@/types/database";

const ALL_RANKS: RankTier[] = ["E", "D", "C", "B", "A", "S", "NATIONAL", "MONARCH"];

export default function DesktopStatsPage() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  return (
    <div className="p-8 space-y-8">
      <PlayerHeader profile={stats.profile} />

      <section>
        <h2 className="font-display text-sm uppercase tracking-[0.3em] text-cyan-500/50 mb-4">
          Rank Progression
        </h2>
        <div className="flex flex-wrap gap-3">
          {ALL_RANKS.map((rank) => (
            <div
              key={rank}
              className={
                stats.profile.rank === rank ? "opacity-100" : "opacity-40"
              }
            >
              <RankBadge rank={rank} />
            </div>
          ))}
        </div>
        <p className="text-sm text-cyan-500/50 mt-4">
          Next rank at level{" "}
          {stats.profile.player_level < 100
            ? stats.profile.player_level + 5
            : "MAX"}
          — Current: {RANK_LABELS[stats.profile.rank]}
        </p>
      </section>

      <CategoryGrid categories={stats.categories} />

      <div className="grid grid-cols-3 gap-4">
        {stats.supplements.map((sup) => (
          <Card key={sup.id} glow>
            <CardHeader>
              <CardTitle className="text-base">{sup.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-mono text-cyan-300">
                Lv.{sup.level}
              </p>
              <p className="text-xs text-cyan-500/50">
                {sup.adherence_score}% adherence · 🔥{sup.current_streak}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
