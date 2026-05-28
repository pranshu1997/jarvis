"use client";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";
import { CalendarHeatmap } from "@/components/features/CalendarHeatmap";
import { useMemo } from "react";

export default function DesktopAnalyticsPage() {
  const { stats, isLoading } = useDashboard();

  const xpByDay = useMemo(() => {
    if (!stats?.recentXpEvents.length) return [];
    const map: Record<string, number> = {};
    for (const e of stats.recentXpEvents) {
      const d = e.created_at.slice(0, 10);
      map[d] = (map[d] ?? 0) + e.final_xp;
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, xp]) => ({ date: date.slice(5), xp }));
  }, [stats?.recentXpEvents]);

  const streakData = useMemo(() => {
    if (!stats) return [];
    return stats.habits
      .filter((h) => h.current_streak > 0)
      .sort((a, b) => b.current_streak - a.current_streak)
      .slice(0, 10)
      .map((h) => ({ name: h.name.slice(0, 12), streak: h.current_streak }));
  }, [stats?.habits]);

  if (isLoading || !stats) return null;

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-cyan-100">Analytics</h1>
        <p className="text-cyan-500/50 mt-1">From your real XP event history</p>
      </header>

      <div className="grid grid-cols-2 gap-6">
        <Card glow>
          <CardHeader>
            <CardTitle>Category XP</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.categories.map((c) => ({ name: c.name, xp: c.total_xp }))}>
                <CartesianGrid stroke="rgba(0,212,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: "#67e8f9", fontSize: 10 }} />
                <YAxis tick={{ fill: "#67e8f9", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(0,212,255,0.3)" }} />
                <Bar dataKey="xp" fill="#00d4ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card glow>
          <CardHeader>
            <CardTitle>XP Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {xpByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={xpByDay}>
                  <CartesianGrid stroke="rgba(0,212,255,0.1)" />
                  <XAxis dataKey="date" tick={{ fill: "#67e8f9", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#67e8f9", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(0,212,255,0.3)" }} />
                  <Line type="monotone" dataKey="xp" stroke="#a855f7" strokeWidth={2} dot={{ fill: "#a855f7" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-cyan-500/40 text-center py-16">No XP events yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Streaks</CardTitle>
        </CardHeader>
        <CardContent>
          {streakData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={streakData} layout="vertical">
                <XAxis type="number" tick={{ fill: "#67e8f9", fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fill: "#67e8f9", fontSize: 9 }} />
                <Bar dataKey="streak" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-cyan-500/40 text-sm">Build streaks to see data</p>
          )}
        </CardContent>
      </Card>

      <Card glow>
        <CardHeader>
          <CardTitle>Activity Calendar (12 weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarHeatmap stats={stats} />
        </CardContent>
      </Card>
    </div>
  );
}
