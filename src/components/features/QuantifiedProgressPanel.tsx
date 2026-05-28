"use client";

import { getHabitProgress } from "@/lib/game-logic";
import { NumericHabitControl } from "@/components/features/NumericHabitControl";
import type { Habit } from "@/types/database";

export function QuantifiedProgressPanel({
  habits,
  onAdjust,
}: {
  habits: Habit[];
  onAdjust: (habitId: string, delta: number) => void;
}) {
  const quantified = habits.filter(
    (h) => h.is_active && getHabitProgress(h).isQuantified
  );

  if (quantified.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="font-display text-xs uppercase tracking-[0.3em] text-cyan-500/50">
        Steps, water &amp; targets
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {quantified.map((h) => (
          <div
            key={h.id}
            className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-3"
          >
            <p className="text-sm font-medium text-cyan-100 mb-1">{h.name}</p>
            <NumericHabitControl habit={h} onAdjust={onAdjust} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
