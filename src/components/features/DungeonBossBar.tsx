"use client";

import type { DungeonState } from "@/lib/player-settings-extended";

export function DungeonBossBar({ dungeon }: { dungeon: DungeonState }) {
  const pct = Math.round((dungeon.boss_hp / dungeon.boss_hp_max) * 100);
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(dungeon.ends_at).getTime() - Date.now()) / 86400000
    )
  );

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-red-200 font-medium">{dungeon.title}</span>
        <span className="text-red-400/60 text-xs">{daysLeft}d left</span>
      </div>
      <div className="h-3 rounded-full bg-slate-900 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-red-300/50">
        Boss HP {dungeon.boss_hp}/{dungeon.boss_hp_max} — complete habits to deal damage
      </p>
    </div>
  );
}
