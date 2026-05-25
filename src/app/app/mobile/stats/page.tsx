"use client";

import { CategoryGrid } from "@/components/features/CategoryGrid";
import { useGameStore } from "@/stores/game-store";
import { HolographicCard } from "@/components/shared/HolographicCard";

export default function MobileStatsPage() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  return (
    <div className="space-y-6 pt-4">
      <h2 className="font-display text-xl font-bold text-cyan-100">Stats</h2>
      <CategoryGrid categories={stats.categories} variant="mobile" />
      <section>
        <h3 className="text-xs uppercase tracking-[0.3em] text-cyan-500/50 mb-3">
          Supplements
        </h3>
        <div className="space-y-2">
          {stats.supplements.map((sup, i) => (
            <HolographicCard key={sup.id} delay={i * 0.05}>
              <div className="flex justify-between items-center">
                <span className="font-medium text-cyan-100">{sup.name}</span>
                <span className="font-mono text-cyan-400">Lv.{sup.level}</span>
              </div>
              <p className="text-xs text-cyan-500/50 mt-1">
                {sup.adherence_score}% · Streak {sup.current_streak}
              </p>
            </HolographicCard>
          ))}
        </div>
      </section>
    </div>
  );
}
