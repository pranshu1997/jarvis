"use client";

import { useGameStore } from "@/stores/game-store";
export function SidebarQuickStats() {
  const stats = useGameStore((s) => s.stats);
  if (!stats?.dailyCompletion) return null;

  const dc = stats.dailyCompletion;
  const pct = dc.total_habits > 0 ? Math.round((dc.completed_habits / dc.total_habits) * 100) : 0;
  const coins = (stats.meta as { shadowCoins?: number })?.shadowCoins ?? 0;
  const combo = (stats.profile.settings?.combo_count as number) ?? 0;

  return (
    <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono text-cyan-500/60 mr-4">
      <span>{pct}% today</span>
      <span>{coins} 🪙</span>
      {combo > 0 && <span>×{combo} combo</span>}
      <span>Lv.{stats.profile.player_level}</span>
    </div>
  );
}
