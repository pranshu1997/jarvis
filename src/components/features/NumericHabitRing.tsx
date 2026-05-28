"use client";

import { getHabitProgress } from "@/lib/game-logic";
import type { Habit } from "@/types/database";

export function NumericHabitRing({
  habit,
  size = 48,
}: {
  habit: Habit;
  size?: number;
}) {
  const p = getHabitProgress(habit);
  if (!p.isQuantified) return null;

  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (p.percent / 100) * circ;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(0,212,255,0.15)"
          strokeWidth={3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#00d4ff"
          strokeWidth={3}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-cyan-300">
        {p.percent}%
      </span>
    </div>
  );
}
