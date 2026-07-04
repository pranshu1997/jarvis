"use client";

import { useGameStore } from "@/stores/game-store";
import { CategoryCompleteAllButton } from "@/components/features/CategoryCompleteAllButton";

export function StallingCategoriesPanel() {
  const stalling = useGameStore((s) => (s.stats?.meta as { stallingCategories?: string[] })?.stallingCategories) ?? [];
  const categories = useGameStore((s) => s.stats?.categories) ?? [];
  if (stalling.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-amber-400/60">Stalling pillars</p>
      {stalling.map((slug) => {
        const cat = categories.find((c) => c.slug === slug);
        return (
          <div key={slug} className="flex items-center justify-between gap-2">
            <span className="text-xs text-amber-100 capitalize">{cat?.name ?? slug}</span>
            <CategoryCompleteAllButton categorySlug={slug} label={cat?.name ?? slug} />
          </div>
        );
      })}
    </div>
  );
}
