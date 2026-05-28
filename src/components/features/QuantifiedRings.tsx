"use client";

import { getHabitProgress } from "@/lib/game-logic";
import type { Habit } from "@/types/database";

export function QuantifiedRings({ habits }: { habits: Habit[] }) {
  const quantified = habits.filter((h) => getHabitProgress(h).isQuantified);

  if (quantified.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {quantified.map((h) => {
        const p = getHabitProgress(h);
        const r = 28;
        const circ = 2 * Math.PI * r;
        const offset = circ - (p.percent / 100) * circ;
        return (
          <div key={h.id} className="flex flex-col items-center shrink-0">
            <svg width="64" height="64" className="-rotate-90">
              <circle
                cx="32"
                cy="32"
                r={r}
                fill="none"
                stroke="rgba(0,212,255,0.1)"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r={r}
                fill="none"
                stroke="#00d4ff"
                strokeWidth="4"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="text-[10px] text-cyan-400/70 mt-1 text-center max-w-[72px] truncate">
              {h.name}
            </span>
            <span className="text-[9px] font-mono text-cyan-500/40">
              {p.percent}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
