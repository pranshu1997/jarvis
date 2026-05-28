"use client";

import { IconResolver } from "@/components/shared/IconResolver";
import type { AchievementRarity, AchievementView } from "@/lib/achievements-db";
import { cn } from "@/lib/utils";

const RARITY_BORDER = {
  common: "border-slate-600",
  rare: "border-cyan-500/40",
  epic: "border-purple-500/50",
  legendary: "border-amber-500/60",
};

export function AchievementsPanel({
  achievements,
  compact = false,
}: {
  achievements: (AchievementView | Omit<AchievementView, "rarity"> & { rarity: string })[];
  compact?: boolean;
}) {
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  return (
    <div className="space-y-4">
      <p className="text-sm text-cyan-500/50">
        {unlocked.length} / {achievements.length} unlocked
      </p>
      <div
        className={cn(
          "grid gap-3",
          compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        )}
      >
        {unlocked.map((a) => (
          <div
            key={a.id}
            className={cn(
              "p-3 rounded-xl border bg-cyan-500/5",
              RARITY_BORDER[a.rarity as AchievementRarity] ?? RARITY_BORDER.common
            )}
          >
            <IconResolver name={a.icon} className="w-5 h-5 text-cyan-400 mb-2" />
            <p className="text-sm font-medium text-cyan-100">{a.title}</p>
            <p className="text-[10px] text-cyan-500/50 mt-1">{a.description}</p>
            <p className="text-[9px] uppercase text-cyan-500/30 mt-2">{a.rarity}</p>
          </div>
        ))}
        {locked.map((a) => (
          <div
            key={a.id}
            className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 opacity-50"
          >
            <div className="w-5 h-5 mb-2 rounded bg-slate-700" />
            <p className="text-sm font-medium text-cyan-100/40">{a.title}</p>
            <p className="text-[10px] text-cyan-500/30 mt-1">???</p>
          </div>
        ))}
      </div>
    </div>
  );
}
