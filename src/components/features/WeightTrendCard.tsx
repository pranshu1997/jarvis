"use client";

import { useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWeightLogs } from "@/lib/player-settings";
import type { DashboardStats } from "@/types/database";
import { jarvisFetch } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast-store";

export function WeightTrendCard({
  stats,
  onLogged,
}: {
  stats: DashboardStats;
  onLogged: () => void;
}) {
  const [kg, setKg] = useState("");
  const logs = getWeightLogs(stats).slice().reverse();

  const submit = async () => {
    const val = Number(kg);
    if (!val) return;
    const res = await jarvisFetch("/api/awareness/weight", {
      method: "POST",
      body: JSON.stringify({ kg: val }),
    });
    if (!res.ok) {
      useToastStore.getState().show("Failed to log weight", "error");
      return;
    }
    setKg("");
    useToastStore.getState().show("Weight logged", "success");
    onLogged();
  };

  const chartData = getWeightLogs(stats)
    .slice()
    .reverse()
    .map((e) => ({ day: e.date.slice(5), kg: e.kg }));

  return (
    <Card glow>
      <CardHeader>
        <CardTitle>Weight trend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            placeholder="kg today"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50"
          />
          <Button variant="hologram" onClick={() => void submit()}>
            Log
          </Button>
        </div>
        {chartData.length >= 2 ? (
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" tick={{ fill: "#67e8f9", fontSize: 10 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "#67e8f9", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(0,212,255,0.3)",
                }}
              />
              <Line type="monotone" dataKey="kg" stroke="#00d4ff" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-cyan-500/40">
            Log twice to see your trend line.
          </p>
        )}
        {logs.length > 0 && (
          <p className="text-xs font-mono text-cyan-400/60">
            Latest: {logs[logs.length - 1].kg} kg
          </p>
        )}
      </CardContent>
    </Card>
  );
}
