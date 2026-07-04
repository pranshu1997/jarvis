"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types/database";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface WeekComparisonProps {
  stats: DashboardStats;
}

function getDeltaIcon(delta: number) {
  if (delta > 0) return <TrendingUp className="w-3.5 h-3.5 text-green-400" />;
  if (delta < 0) return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-cyan-500/40" />;
}

function getDeltaColor(delta: number) {
  if (delta > 0) return "text-green-400";
  if (delta < 0) return "text-red-400";
  return "text-cyan-500/40";
}

export function WeekComparison({ stats }: WeekComparisonProps) {
  const { thisWeek, deltas } = useMemo(() => {
    const now = Date.now();
    const msPerDay = 86_400_000;
    const thisWeekStart = now - 7 * msPerDay;
    const lastWeekStart = now - 14 * msPerDay;

    let thisXp = 0;
    let lastXp = 0;

    for (const e of stats.recentXpEvents) {
      const t = new Date(e.created_at).getTime();
      if (t >= thisWeekStart) thisXp += e.final_xp;
      else if (t >= lastWeekStart) lastXp += e.final_xp;
    }

    const thisStreakSum = stats.habits.reduce((s, h) => s + (h.current_streak ?? 0), 0);
    const thisCompleted = stats.habits.filter((h) => h.completed_today).length;
    const totalActive = stats.habits.filter((h) => h.is_active).length;
    const thisRate = totalActive > 0 ? Math.round((thisCompleted / totalActive) * 100) : 0;

    const xpDelta = lastXp > 0 ? Math.round(((thisXp - lastXp) / lastXp) * 100) : 0;

    return {
      thisWeek: { xp: thisXp, streaks: thisStreakSum, rate: thisRate },
      deltas: { xp: xpDelta, xpAbs: thisXp - lastXp },
    };
  }, [stats]);

  const metrics = [
    {
      label: "XP this week",
      value: thisWeek.xp.toLocaleString(),
      delta: deltas.xpAbs,
      pct: deltas.xp,
    },
    {
      label: "Completion rate",
      value: `${thisWeek.rate}%`,
      delta: 0,
      pct: 0,
    },
    {
      label: "Active streaks",
      value: thisWeek.streaks.toString(),
      delta: 0,
      pct: 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Week-over-Week
          <span className="text-xs font-normal text-cyan-500/50">vs last 7 days</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-lg bg-slate-900/50 p-4 space-y-1">
              <p className="text-xs text-cyan-500/50">{m.label}</p>
              <p className="text-2xl font-display font-bold text-cyan-100">{m.value}</p>
              {m.delta !== 0 && (
                <div className={`flex items-center gap-1 text-xs ${getDeltaColor(m.delta)}`}>
                  {getDeltaIcon(m.delta)}
                  {m.delta > 0 ? "+" : ""}{m.delta.toLocaleString()}
                  {m.pct !== 0 && (
                    <span className="text-[10px] opacity-70">({m.pct > 0 ? "+" : ""}{m.pct}%)</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
