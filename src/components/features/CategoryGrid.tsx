"use client";

import { HolographicCard } from "@/components/shared/HolographicCard";
import { IconResolver } from "@/components/shared/IconResolver";
import { RankBadge } from "@/components/shared/RankBadge";
import { XpBar } from "@/components/effects/XpBar";
import { xpProgressInLevel } from "@/lib/xp-engine";
import type { Category } from "@/types/database";

interface CategoryGridProps {
  categories: Category[];
  variant?: "desktop" | "mobile";
}

export function CategoryGrid({ categories, variant = "desktop" }: CategoryGridProps) {
  const cols = variant === "desktop" ? "grid-cols-2 xl:grid-cols-4" : "grid-cols-2";

  return (
    <div className={`grid ${cols} gap-4`}>
      {categories.map((cat, i) => {
        const xp = xpProgressInLevel(cat.total_xp, cat.level);
        return (
          <HolographicCard key={cat.id} delay={i * 0.1} glowColor={`${cat.color}20`}>
            <div className="flex items-start justify-between mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                <IconResolver
                  name={cat.icon}
                  className="w-5 h-5"
                  style={{ color: cat.color }}
                />
              </div>
              <RankBadge rank={cat.rank} size="sm" />
            </div>
            <h3 className="font-display font-semibold text-cyan-50">{cat.name}</h3>
            <p className="text-xs text-cyan-500/50 mt-1">
              🔥 {cat.current_streak} day streak
            </p>
            <div className="mt-4">
              <XpBar
                label=""
                current={xp.current}
                required={xp.required}
                percent={xp.percent}
                level={cat.level}
                showValues={false}
                size="sm"
                color="from-cyan-400 to-purple-500"
              />
            </div>
          </HolographicCard>
        );
      })}
    </div>
  );
}
