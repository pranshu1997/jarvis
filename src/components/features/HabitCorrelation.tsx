"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types/database";

interface HabitCorrelationProps {
  stats: DashboardStats;
}

export function HabitCorrelation({ stats }: HabitCorrelationProps) {
  const pairs = useMemo(() => {
    const byStreak = stats.habits
      .filter((h) => h.is_active && h.current_streak >= 3)
      .sort((a, b) => b.current_streak - a.current_streak)
      .slice(0, 6);

    const result: { a: string; b: string; score: number }[] = [];
    for (let i = 0; i < byStreak.length; i++) {
      for (let j = i + 1; j < byStreak.length; j++) {
        const ha = byStreak[i];
        const hb = byStreak[j];
        const sameCategory = ha.category_id === hb.category_id;
        const streakSim =
          1 - Math.abs(ha.current_streak - hb.current_streak) / Math.max(ha.current_streak, hb.current_streak, 1);
        const score = Math.round((sameCategory ? 0.4 : 0) + streakSim * 0.6 * 100);
        if (score >= 30) {
          result.push({ a: ha.name, b: hb.name, score });
        }
      }
    }
    return result.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [stats.habits]);

  if (pairs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Habit Correlation
          <span className="text-xs font-normal text-cyan-500/50 ml-2">
            habits that tend to succeed together
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pairs.map((pair) => (
            <div key={`${pair.a}-${pair.b}`} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-cyan-100 truncate">
                  <span className="text-cyan-300">{pair.a}</span>
                  <span className="text-cyan-500/40 mx-2">↔</span>
                  <span className="text-cyan-300">{pair.b}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-24 h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${pair.score}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-cyan-400 w-8">{pair.score}%</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-cyan-500/30 mt-4">
          Correlation estimated from streak similarity and category overlap.
        </p>
      </CardContent>
    </Card>
  );
}
