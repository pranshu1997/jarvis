"use client";

import { useGameStore } from "@/stores/game-store";
import { Swords } from "lucide-react";

export function GuildWarBanner() {
  const meta = useGameStore((s) => s.stats?.meta as {
    guildWar?: { leader: string; xpByCategory: Record<string, number> };
  } | undefined);

  const gw = meta?.guildWar;
  if (!gw) return null;

  const leader = gw.leader.charAt(0).toUpperCase() + gw.leader.slice(1);
  const xp = gw.xpByCategory[gw.leader] ?? 0;

  return (
    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-2 flex items-center gap-2">
      <Swords className="w-3.5 h-3.5 text-purple-400" />
      <p className="text-xs text-purple-200/80">
        Guild War leader: <span className="text-purple-300 font-semibold">{leader}</span>
        <span className="text-purple-500/50 ml-1">({xp.toLocaleString()} XP)</span>
      </p>
    </div>
  );
}
