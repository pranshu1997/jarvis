"use client";

import { HolographicCard } from "@/components/shared/HolographicCard";
import { RankBadge } from "@/components/shared/RankBadge";
import { XpBar } from "@/components/effects/XpBar";
import { computeSupplementStackLevel } from "@/lib/supplements";
import { xpProgressInLevel } from "@/lib/xp-engine";
import type { Supplement } from "@/types/database";

export function SupplementOverallCard({ supplements }: { supplements: Supplement[] }) {
  const stack = computeSupplementStackLevel(supplements);
  const xp = xpProgressInLevel(stack.totalXp, stack.level);

  return (
    <HolographicCard glowColor="#22c55e20">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-500/50">
            Supplement Stack
          </p>
          <h3 className="font-display text-lg font-semibold text-cyan-100">
            Overall Level {stack.level}
          </h3>
        </div>
        <RankBadge rank={stack.rank} size="sm" />
      </div>
      <div className="mt-3">
        <XpBar
          label=""
          current={xp.current}
          required={xp.required}
          percent={xp.percent}
          size="sm"
        />
      </div>
      <p className="text-xs text-cyan-500/50 mt-2">
        {stack.takenToday}/{stack.total} taken today · {stack.avgAdherence}% adherence ·
        🔥{stack.totalStreak} combined streak
      </p>
    </HolographicCard>
  );
}
