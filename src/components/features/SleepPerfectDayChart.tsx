"use client";

import { useGameStore } from "@/stores/game-store";
import { sleepPerfectDayCorrelation, habitROIRanking } from "@/lib/analytics-correlation";

export function SleepPerfectDayChart() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  const { dataPoints, correlation } = sleepPerfectDayCorrelation(stats);
  if (dataPoints.length === 0) {
    return <p className="text-xs text-cyan-500/40">Sync health data to see sleep ↔ perfect day correlation</p>;
  }

  const maxSleep = Math.max(...dataPoints.map((d) => d.sleep), 8);

  return (
    <div className="space-y-2">
      <p className="text-xs text-cyan-500/50">
        Sleep delta on perfect days: {correlation >= 0 ? "+" : ""}{correlation}h
      </p>
      <div className="flex items-end gap-1 h-16">
        {dataPoints.slice(-14).map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className={`w-full rounded-t ${d.perfect ? "bg-emerald-500/60" : "bg-cyan-500/30"}`}
              style={{ height: `${(d.sleep / maxSleep) * 100}%`, minHeight: 4 }}
              title={`${d.date}: ${d.sleep}h`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HabitROIChart() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  const ranking = habitROIRanking(stats).slice(0, 5);
  if (ranking.length === 0) return null;

  return (
    <div className="space-y-2">
      {ranking.map((r) => (
        <div key={r.habitId} className="flex items-center gap-2">
          <span className="text-xs text-cyan-300/70 flex-1 truncate">{r.title}</span>
          <div className="w-24 h-1.5 rounded-full bg-cyan-950 overflow-hidden">
            <div className="h-full bg-cyan-400" style={{ width: `${r.score}%` }} />
          </div>
          <span className="text-[10px] text-cyan-500/50 w-8">{r.score}%</span>
        </div>
      ))}
    </div>
  );
}
