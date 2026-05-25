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
import { useGameStore } from "@/stores/game-store";

const HEATMAP = Array.from({ length: 28 }, (_, i) => ({
  day: i + 1,
  physical: Math.floor(Math.random() * 100),
  mental: Math.floor(Math.random() * 100),
  awareness: Math.floor(Math.random() * 100),
  vitality: Math.floor(Math.random() * 100),
}));

const STREAK_DATA = [
  { week: "W1", streak: 5 },
  { week: "W2", streak: 7 },
  { week: "W3", streak: 12 },
  { week: "W4", streak: 8 },
];

export default function DesktopAnalyticsPage() {
  const stats = useGameStore((s) => s.stats);

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-cyan-100">
          Analytics
        </h1>
        <p className="text-cyan-500/50 mt-1">Deep performance intelligence</p>
      </header>

      <div className="grid grid-cols-2 gap-6">
        <Card glow>
          <CardHeader>
            <CardTitle>Category XP Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={
                  stats?.categories.map((c) => ({
                    name: c.name,
                    xp: c.total_xp,
                  })) ?? []
                }
              >
                <CartesianGrid stroke="rgba(0,212,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: "#67e8f9", fontSize: 10 }} />
                <YAxis tick={{ fill: "#67e8f9", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(0,212,255,0.3)",
                  }}
                />
                <Bar dataKey="xp" fill="#00d4ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card glow>
          <CardHeader>
            <CardTitle>Streak Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={STREAK_DATA}>
                <CartesianGrid stroke="rgba(0,212,255,0.1)" />
                <XAxis dataKey="week" tick={{ fill: "#67e8f9", fontSize: 10 }} />
                <YAxis tick={{ fill: "#67e8f9", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(0,212,255,0.3)",
                  }}
                />
                <Line type="monotone" dataKey="streak" stroke="#a855f7" strokeWidth={2} dot={{ fill: "#a855f7" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>28-Day Category Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {HEATMAP.map((d) => (
              <div
                key={d.day}
                className="aspect-square rounded"
                style={{
                  backgroundColor: `rgba(0,212,255,${(d.physical + d.mental) / 400})`,
                }}
                title={`Day ${d.day}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
