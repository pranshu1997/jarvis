"use client";

import { motion } from "framer-motion";
import { Check, Flame } from "lucide-react";
import { IconResolver } from "@/components/shared/IconResolver";
import { NumericHabitControl } from "@/components/features/NumericHabitControl";
import { getHabitProgress } from "@/lib/game-logic";
import { getHabitBaseXp, getHabitMetadata } from "@/lib/habit-xp";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types/database";

interface HabitListProps {
  habits: Habit[];
  categorySlug?: string;
  onToggle: (habitId: string, completed: boolean) => void;
  onIncrement?: (habitId: string, delta: number) => void;
  compact?: boolean;
  allHabits?: Habit[];
}

export function HabitList({
  habits,
  categorySlug,
  onToggle,
  onIncrement,
  compact = false,
  allHabits,
}: HabitListProps) {
  const pool = allHabits ?? habits;
  const filtered = categorySlug
    ? habits.filter(
        (h) => (h.metadata as { category_slug?: string })?.category_slug === categorySlug
      )
    : habits;

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-cyan-500/40 text-center py-8">
        No habits in this category
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      {filtered.map((habit, i) => {
        const progress = getHabitProgress(habit);
        const isQuant = progress.isQuantified;

        if (isQuant && onIncrement) {
          return (
            <div
              key={habit.id}
              className="w-full p-3 rounded-xl border border-slate-700/50 bg-slate-900/40"
            >
              <div className="flex items-center gap-3">
                <IconResolver name={habit.icon} className="w-4 h-4 text-cyan-400/60" />
                <span className="font-medium text-cyan-100/70">{habit.name}</span>
              </div>
              <NumericHabitControl
                habit={habit}
                onAdjust={onIncrement}
                compact={compact}
              />
            </div>
          );
        }

        return (
          <motion.button
            key={habit.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onToggle(habit.id, !habit.completed_today)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
              habit.completed_today
                ? "border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                : "border-slate-700/50 bg-slate-900/40 hover:border-cyan-500/30",
              compact && "p-2"
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                habit.completed_today
                  ? "bg-cyan-500 border-cyan-400"
                  : "border-slate-600 bg-slate-800"
              )}
            >
              {habit.completed_today ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="w-4 h-4 text-slate-900" />
                </motion.div>
              ) : (
                <IconResolver name={habit.icon} className="w-4 h-4 text-cyan-400/60" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "font-medium truncate",
                  habit.completed_today ? "text-cyan-200" : "text-cyan-100/70"
                )}
              >
                {habit.name}
              </p>
              <p className="text-xs text-cyan-500/40">
                +{getHabitBaseXp(habit, pool)} XP
                {!habit.is_system && getHabitMetadata(habit).toughness != null && (
                  <span>
                    {" "}
                    · {(getHabitMetadata(habit).toughness ?? 1).toFixed(1)}×
                  </span>
                )}
              </p>
            </div>
            {habit.current_streak > 0 && (
              <div className="flex items-center gap-1 text-orange-400 text-xs">
                <Flame className="w-3 h-3" />
                {habit.current_streak}
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
