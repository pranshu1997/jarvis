"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  getTargetOptionsForHabit,
  isConfigurableQuantifiedHabit,
  formatStepsTarget,
} from "@/lib/quantified-habits";
import { jarvisFetch } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast-store";
import type { DashboardStats, Habit } from "@/types/database";

function targetLabel(habit: Habit, value: number): string {
  if (habit.unit === "steps" || habit.slug.startsWith("steps")) {
    return `${formatStepsTarget(value)} steps`;
  }
  if (habit.unit === "glasses") return `${value} glasses`;
  if (habit.unit === "hours") return `${value}h sleep`;
  return `${value} ${habit.unit ?? ""}`.trim();
}

export function HabitTargetsSettings({
  stats,
  onUpdated,
}: {
  stats: DashboardStats;
  onUpdated: () => void;
}) {
  const quantified = useMemo(
    () => stats.habits.filter((h) => h.is_active && isConfigurableQuantifiedHabit(h)),
    [stats.habits]
  );

  if (quantified.length === 0) return null;

  const setTarget = async (habitId: string, targetValue: number) => {
    const res = await jarvisFetch("/api/habits/target", {
      method: "PATCH",
      body: JSON.stringify({ habitId, targetValue }),
    });
    const data = await res.json();
    if (!res.ok) {
      useToastStore.getState().show(data.error ?? "Failed", "error");
      return;
    }
    useToastStore.getState().show(
      data.name ? `Target updated · ${data.name}` : "Target updated",
      "success"
    );
    onUpdated();
  };

  return (
    <div className="space-y-6">
      {quantified.map((habit) => {
        const options = getTargetOptionsForHabit(habit);
        const current = habit.target_value ?? 0;

        return (
          <div key={habit.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-cyan-100">{habit.name}</p>
              <span className="text-xs font-mono text-cyan-500/50">
                now {targetLabel(habit, current)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => (
                <Button
                  key={opt}
                  type="button"
                  size="sm"
                  variant={opt === current ? "hologram" : "outline"}
                  onClick={() => void setTarget(habit.id, opt)}
                >
                  {targetLabel(habit, opt)}
                </Button>
              ))}
            </div>
          </div>
        );
      })}
      <p className="text-[11px] text-cyan-500/40">
        Lower targets for easier days. Raising a target won&apos;t auto-complete — log
        progress as usual.
      </p>
    </div>
  );
}
