"use client";

import { useGameStore } from "@/stores/game-store";

export function PerfectWeekCountdown() {
  const pw = useGameStore((s) => (s.stats?.meta as {
    perfectWeek?: { perfectDays: number; needed: number; daysLeftInWeek: number; onTrack: boolean };
  } | undefined)?.perfectWeek);
  if (!pw || pw.perfectDays >= 5) return null;

  return (
    <div className={`rounded-lg px-3 py-2 text-xs border ${pw.onTrack ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" : "border-amber-500/20 bg-amber-500/5 text-amber-300"}`}>
      Perfect week: {pw.perfectDays}/5 · need {pw.needed} more in {pw.daysLeftInWeek}d
    </div>
  );
}
