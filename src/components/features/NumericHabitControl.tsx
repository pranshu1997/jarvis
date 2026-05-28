"use client";

import { getHabitProgress } from "@/lib/game-logic";
import { getAdjustPresets } from "@/lib/quantified-habits";
import type { Habit } from "@/types/database";
import { cn } from "@/lib/utils";

interface NumericHabitControlProps {
  habit: Habit;
  onAdjust: (habitId: string, delta: number) => void;
  compact?: boolean;
}

export function NumericHabitControl({
  habit,
  onAdjust,
  compact,
}: NumericHabitControlProps) {
  const progress = getHabitProgress(habit);
  if (!progress.isQuantified) return null;

  const { increase, decrease } = getAdjustPresets(habit);

  return (
    <div className={cn("mt-2 space-y-2", compact && "mt-1")}>
      <div className="flex items-center justify-between text-[10px] text-cyan-500/50">
        <span>
          {progress.current.toLocaleString()} / {progress.target.toLocaleString()}{" "}
          {habit.unit}
        </span>
        <span>{progress.percent}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {decrease.map((p) => (
          <button
            key={p.label}
            type="button"
            disabled={progress.current <= 0 && p.delta < 0}
            onClick={(e) => {
              e.stopPropagation();
              onAdjust(habit.id, p.delta);
            }}
            className="px-2 py-1 text-[10px] rounded-md border border-slate-600/50 bg-slate-800/60 text-cyan-400/70 hover:bg-slate-700/60 disabled:opacity-30"
          >
            {p.label}
          </button>
        ))}
        {increase.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdjust(habit.id, p.delta);
            }}
            className="px-2 py-1 text-[10px] rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
          >
            {p.label}
          </button>
        ))}
      </div>
      {habit.completed_today && (
        <p className="text-[9px] text-cyan-500/40">
          Use − to correct count (marks incomplete if below target)
        </p>
      )}
    </div>
  );
}
