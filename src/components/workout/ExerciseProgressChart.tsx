"use client";

import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { WorkoutLogEntry } from "@/types/database";

export function ExerciseProgressChart({
  logs,
  exerciseId,
}: {
  logs: WorkoutLogEntry[];
  exerciseId: string | null;
}) {
  const data = useMemo(() => {
    if (!exerciseId) return [];
    return logs
      .filter((l) => l.exercise_id === exerciseId && l.weight != null)
      .slice(0, 20)
      .reverse()
      .map((l, i) => ({
        n: i + 1,
        weight: l.weight,
        xp: l.xp_earned,
      }));
  }, [logs, exerciseId]);

  if (!exerciseId || data.length < 2) {
    return (
      <p className="text-sm text-cyan-500/40 py-6 text-center">
        Select an exercise with 2+ weighted logs to see progression
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(0,212,255,0.08)" />
        <XAxis dataKey="n" tick={{ fill: "#67e8f9", fontSize: 10 }} />
        <YAxis tick={{ fill: "#67e8f9", fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            background: "#0f172a",
            border: "1px solid rgba(0,212,255,0.3)",
          }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#00d4ff"
          strokeWidth={2}
          dot={{ fill: "#00d4ff", r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
