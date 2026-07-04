"use client";

import { useGameStore } from "@/stores/game-store";
import { Calendar } from "lucide-react";

export function AppOpenStreakBadge() {
  const streak = useGameStore((s) => (s.stats?.meta as { appOpenStreak?: number })?.appOpenStreak) ?? 0;
  if (streak < 2) return null;

  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400/70 border border-cyan-500/20 rounded-full px-2 py-0.5">
      <Calendar className="w-3 h-3" />
      {streak}d app streak
    </span>
  );
}
