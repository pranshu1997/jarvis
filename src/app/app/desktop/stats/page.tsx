"use client";

import { CategoryGrid } from "@/components/features/CategoryGrid";
import { PlayerHeader } from "@/components/features/PlayerHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankBadge } from "@/components/shared/RankBadge";
import { useGameStore } from "@/stores/game-store";
import { RANK_LABELS } from "@/lib/xp-engine";
import { SupplementOverallCard } from "@/components/features/SupplementOverallCard";
import { AchievementsPanel } from "@/components/features/AchievementsPanel";
import { WeightTrendCard } from "@/components/features/WeightTrendCard";
import { BodyMeasurementsCard } from "@/components/features/BodyMeasurementsCard";
import { MacroLogger } from "@/components/features/MacroLogger";
import { CharacterEvolution } from "@/components/features/CharacterEvolution";
import { ProgressPhotosGallery } from "@/components/features/ProgressPhotosGallery";
import { StreakShieldPanel } from "@/components/features/StreakShieldPanel";
import { useDashboard } from "@/hooks/useDashboard";
import type { RankTier } from "@/types/database";

const ALL_RANKS: RankTier[] = ["E", "D", "C", "B", "A", "S", "NATIONAL", "MONARCH"];

export default function DesktopStatsPage() {
  const stats = useGameStore((s) => s.stats);
  const { refetch, isLoading } = useDashboard();
  if (isLoading || !stats) return null;

  return (
    <div className="p-8 space-y-8">
      <PlayerHeader profile={stats.profile} />
      <CharacterEvolution profile={stats.profile} />

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

      <SupplementOverallCard supplements={stats.supplements} />

      <WeightTrendCard stats={stats} onLogged={refetch} />
      <BodyMeasurementsCard onLogged={refetch} />
      <MacroLogger onLogged={refetch} />
      <ProgressPhotosGallery />
      <StreakShieldPanel stats={stats} />

      <section>
        <h2 className="font-display text-sm uppercase tracking-[0.3em] text-cyan-500/50 mb-4">
          Achievements
        </h2>
        <AchievementsPanel achievements={stats.meta?.achievements ?? []} />
      </section>

      <section>
        <h2 className="font-display text-sm uppercase tracking-[0.3em] text-cyan-500/50 mb-4">
          Sports Levels
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {stats.sports
            .filter((s) => s.slug !== "overall")
            .map((sport) => (
              <Card key={sport.id} glow>
                <CardHeader>
                  <CardTitle className="text-base">{sport.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-mono text-cyan-300">
                    Lv.{sport.level}
                  </p>
                  <p className="text-xs text-cyan-500/50">
                    {sport.sessions_count} sessions · 🔥{sport.current_streak} ·{" "}
                    {sport.rank}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-sm uppercase tracking-[0.3em] text-cyan-500/50 mb-4">
          Workout Skills
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {stats.skills
            .filter((s) => s.skill_type === "workout_branch" || s.skill_type === "muscle_group")
            .map((skill) => (
              <Card key={skill.id}>
                <CardContent className="pt-4">
                  <p className="text-sm font-medium text-cyan-100">{skill.name}</p>
                  <p className="text-lg font-mono text-cyan-300">Lv.{skill.level}</p>
                  <p className="text-[10px] text-cyan-500/40">{skill.rank}</p>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>

      {stats.exercises.length > 0 && (
        <section>
          <h2 className="font-display text-sm uppercase tracking-[0.3em] text-cyan-500/50 mb-4">
            Exercise PRs
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {stats.exercises
              .filter((e) => e.personal_record != null)
              .map((ex) => (
                <p
                  key={ex.id}
                  className="text-sm text-cyan-100/70 font-mono px-3 py-2 rounded-lg border border-slate-700"
                >
                  {ex.name}: {ex.personal_record}
                  {ex.pr_unit}
                </p>
              ))}
          </div>
        </section>
      )}

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
