"use client";

import { HolographicCard } from "@/components/shared/HolographicCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XpBar } from "@/components/effects/XpBar";
import { xpProgressInLevel } from "@/lib/xp-engine";

const WORKOUT_TREE = [
  {
    name: "Strength",
    color: "#3b82f6",
    children: ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"],
    exercises: ["Bench Press", "Squat", "Deadlift", "Pullups", "Shoulder Press", "Leg Press"],
  },
  {
    name: "Sports",
    color: "#f59e0b",
    children: ["Overall Sports Level"],
    exercises: [],
  },
  {
    name: "Endurance",
    color: "#06b6d4",
    children: ["Cardio", "HIIT"],
    exercises: [],
  },
  {
    name: "Flexibility",
    color: "#8b5cf6",
    children: ["Stretching", "Yoga"],
    exercises: [],
  },
  {
    name: "Mobility",
    color: "#14b8a6",
    children: ["Joint Work", "Foam Roll"],
    exercises: [],
  },
  {
    name: "Fighting",
    color: "#ef4444",
    children: ["Striking", "Grappling"],
    exercises: [],
  },
];

export default function DesktopWorkoutPage() {
  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-cyan-100">
          Workout System
        </h1>
        <p className="text-cyan-500/50 mt-1">
          Deep progression tree — Strength, Sports, Endurance, Flexibility, Mobility, Fighting
        </p>
      </header>

      <div className="grid grid-cols-3 gap-6">
        {WORKOUT_TREE.map((branch, i) => {
          const level = 3 + i;
          const xp = xpProgressInLevel(level * 200, level);
          return (
            <HolographicCard key={branch.name} delay={i * 0.1} glowColor={`${branch.color}20`}>
              <h3 className="font-display font-semibold" style={{ color: branch.color }}>
                {branch.name}
              </h3>
              <XpBar
                label={`${branch.name} Level`}
                current={xp.current}
                required={xp.required}
                percent={xp.percent}
                level={level}
                size="sm"
              />
              <div className="mt-3 flex flex-wrap gap-1">
                {branch.children.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-2 py-0.5 rounded border border-slate-600 text-cyan-100/50"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </HolographicCard>
          );
        })}
      </div>

      <Card glow>
        <CardHeader>
          <CardTitle>Strength — Exercise Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {WORKOUT_TREE[0].exercises.map((ex, i) => (
              <div
                key={ex}
                className="p-4 rounded-xl border border-cyan-500/20 bg-slate-900/50"
              >
                <p className="font-medium text-cyan-100">{ex}</p>
                <p className="text-xs text-cyan-500/40 mt-1">Lv.{5 + i} · PR tracking</p>
                <XpBar
                  label=""
                  current={40 + i * 10}
                  required={100}
                  percent={40 + i * 10}
                  showValues={false}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
