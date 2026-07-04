"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";
import { CalendarHeatmap } from "@/components/features/CalendarHeatmap";
import { CategoryRadarChart } from "@/components/features/CategoryRadarChart";
import { SleepPerfectDayChart, HabitROIChart } from "@/components/features/SleepPerfectDayChart";
import { WeekComparePicker } from "@/components/features/TimelineFilters";
import { BarChart3 } from "lucide-react";

const CHART_STYLE = {
  background: "#0f172a",
  border: "1px solid rgba(0,212,255,0.3)",
  fontSize: 11,
};

export default function MobileAnalyticsPage() {
  const { stats, isLoading } = useDashboard();

  const xpLast7 = useMemo(() => {
    if (!stats?.recentXpEvents.length) return [];
    const map: Record<string, number> = {};
    for (const e of stats.recentXpEvents) {
      const d = e.created_at.slice(0, 10);
      map[d] = (map[d] ?? 0) + e.final_xp;
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, xp]) => ({ date: date.slice(5), xp }));
  }, [stats?.recentXpEvents]);

  const categoryData = useMemo(() => {
    if (!stats) return [];
    return stats.categories.map((c) => ({ name: c.name.slice(0, 8), xp: c.total_xp }));
  }, [stats?.categories]);

  if (isLoading || !stats) return null;

  return (
    <div className="space-y-6 pt-4">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-cyan-100">Analytics</h1>
          <p className="text-[11px] text-cyan-500/50">From real XP event history</p>
        </div>
      </header>

      <Card glow>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">7-Day XP</CardTitle>
        </CardHeader>
        <CardContent>
          {xpLast7.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={xpLast7}>
                <XAxis dataKey="date" tick={{ fill: "#67e8f9", fontSize: 9 }} />
                <YAxis tick={{ fill: "#67e8f9", fontSize: 9 }} width={32} />
                <Tooltip contentStyle={CHART_STYLE} />
                <Line
                  type="monotone"
                  dataKey="xp"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ fill: "#a855f7", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-cyan-500/40 text-center py-10">No XP events yet</p>
          )}
        </CardContent>
      </Card>

      <Card glow>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Category XP</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" tick={{ fill: "#67e8f9", fontSize: 9 }} />
              <YAxis tick={{ fill: "#67e8f9", fontSize: 9 }} width={32} />
              <Tooltip contentStyle={CHART_STYLE} />
              <Bar dataKey="xp" fill="#00d4ff" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Category Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryRadarChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Sleep ↔ Perfect Days</CardTitle>
        </CardHeader>
        <CardContent>
          <SleepPerfectDayChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Habit ROI</CardTitle>
        </CardHeader>
        <CardContent>
          <HabitROIChart />
        </CardContent>
      </Card>

      <WeekComparePicker />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Activity Calendar</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <CalendarHeatmap stats={stats} />
        </CardContent>
      </Card>
    </div>
  );
}
