"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, Flame, Shield } from "lucide-react";
import { IconResolver } from "@/components/shared/IconResolver";
import { NumericHabitControl } from "@/components/features/NumericHabitControl";
import { getHabitProgress } from "@/lib/game-logic";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types/database";

interface SwipeHabitListProps {
  habits: Habit[];
  onComplete: (habitId: string) => void;
  onSkip?: (habitId: string) => void;
  onIncrement?: (habitId: string, delta: number) => void;
  onCompleteCategory?: (categorySlug: string) => void;
}

function SwipeCard({
  habit,
  onComplete,
  onSkip,
  onIncrement,
}: {
  habit: Habit;
  onComplete: () => void;
  onSkip?: () => void;
  onIncrement?: (habitId: string, delta: number) => void;
}) {
  const x = useMotionValue(0);
  const bg = useTransform(x, [-120, 0, 120], ["#ef444420", "#0f172a80", "#10b98120"]);
  const [dragging, setDragging] = useState(false);
  const progress = getHabitProgress(habit);
  const skipped = !!(habit.metadata as { skipped_today?: boolean }).skipped_today;

  if (skipped) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 opacity-80">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-400/80" />
          <div>
            <p className="font-medium text-amber-100/90">{habit.name}</p>
            <p className="text-xs text-amber-400/60">Streak shield — skipped today</p>
          </div>
          {habit.current_streak > 0 && (
            <span className="ml-auto flex items-center gap-1 text-orange-400 text-sm">
              <Flame className="w-4 h-4" />
              {habit.current_streak}
            </span>
          )}
        </div>
      </div>
    );
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    if (info.offset.x > 80) onComplete();
    else if (info.offset.x < -80) onSkip?.();
  };

  if (progress.isQuantified && !habit.completed_today) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3">
        <div className="flex items-center gap-3">
          <IconResolver name={habit.icon} className="w-5 h-5 text-cyan-400/60" />
          <span className="font-medium text-cyan-100">{habit.name}</span>
          {habit.current_streak > 0 && (
            <span className="ml-auto flex items-center gap-1 text-orange-400 text-xs">
              <Flame className="w-3 h-3" />{habit.current_streak}
            </span>
          )}
        </div>
        {onIncrement && (
          <NumericHabitControl
            habit={habit}
            onAdjust={(id, d) => onIncrement(id, d)}
            compact
          />
        )}
      </div>
    );
  }

  return (
    <motion.div
      style={{ x, backgroundColor: dragging ? bg : undefined }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      className={cn(
        "relative rounded-xl border p-4 touch-pan-y",
        habit.completed_today
          ? "border-cyan-400/40 bg-cyan-500/10"
          : "border-slate-700/50 bg-slate-900/60"
      )}
    >
      <div className="flex items-center gap-3 pointer-events-none">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            habit.completed_today ? "bg-cyan-500" : "bg-slate-800 border border-slate-600"
          )}
        >
          {habit.completed_today ? (
            <Check className="w-5 h-5 text-slate-900" />
          ) : (
            <IconResolver name={habit.icon} className="w-5 h-5 text-cyan-400/60" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-cyan-100">{habit.name}</p>
          <p className="text-xs text-cyan-500/40">Swipe right → complete</p>
        </div>
        {habit.current_streak > 0 && (
          <span className="flex items-center gap-1 text-orange-400 text-sm">
            <Flame className="w-4 h-4" />{habit.current_streak}
          </span>
        )}
      </div>
      {!habit.completed_today && (
        <button
          type="button"
          onClick={onComplete}
          className="mt-3 w-full py-2 text-xs rounded-lg border border-cyan-500/30 text-cyan-400 pointer-events-auto"
        >
          Tap to complete
        </button>
      )}
    </motion.div>
  );
}

export function SwipeHabitList({
  habits,
  onComplete,
  onSkip,
  onIncrement,
  onCompleteCategory,
}: SwipeHabitListProps) {
  const grouped = habits.reduce(
    (acc, h) => {
      const slug =
        (h.metadata as { category_slug?: string })?.category_slug ?? "other";
      if (!acc[slug]) acc[slug] = [];
      acc[slug].push(h);
      return acc;
    },
    {} as Record<string, Habit[]>
  );

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([catSlug, catHabits]) => (
        <div key={catSlug}>
          {onCompleteCategory && (
            <button
              type="button"
              onContextMenu={(e) => {
                e.preventDefault();
                onCompleteCategory(catSlug);
              }}
              onClick={() => {}}
              className="text-[10px] uppercase tracking-wider text-cyan-500/40 mb-2 block w-full text-left"
            >
              {catSlug} · long-press category to complete all
            </button>
          )}
          <div className="space-y-3">
            {catHabits.map((habit) => (
              <SwipeCard
                key={habit.id}
                habit={habit}
                onComplete={() => onComplete(habit.id)}
                onSkip={() => onSkip?.(habit.id)}
                onIncrement={onIncrement}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
