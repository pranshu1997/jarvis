"use client";

import { useState } from "react";
import { SwipeHabitList } from "@/components/features/SwipeHabitList";
import { CustomHabitForm } from "@/components/features/CustomHabitForm";
import { SupplementStack } from "@/components/features/SupplementStack";
import { SkipHabitDialog } from "@/components/features/SkipHabitDialog";
import { HABIT_PERIODS, filterHabitsByPeriod, type HabitPeriod } from "@/lib/habit-periods";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";
import { jarvisFetch } from "@/lib/api-client";

export default function MobileLogPage() {
  const [active, setActive] = useState<HabitPeriod>("morning");
  const [showCreate, setShowCreate] = useState(false);
  const [skipTarget, setSkipTarget] = useState<{ id: string; name: string } | null>(null);
  const {
    stats,
    completeHabit,
    skipHabit,
    incrementHabit,
    toggleSupplement,
    completeCategory,
    refetch,
    isLoading,
  } = useDashboard();

  if (isLoading || !stats) return null;

  const catHabits = filterHabitsByPeriod(
    stats.habits.filter((h) => h.is_active),
    active
  );

  return (
    <div className="space-y-4 pt-4 pb-24">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-cyan-100">Rapid Log</h2>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="text-xs px-3 py-1.5 rounded-full border border-cyan-500/40 text-cyan-300"
        >
          {showCreate ? "Close" : "+ Habit"}
        </button>
      </div>

      {showCreate && (
        <div className="p-4 rounded-xl border border-cyan-500/25 bg-slate-900/60">
          <CustomHabitForm
            habits={stats.habits}
            compact
            onCreated={() => {
              refetch();
              setShowCreate(false);
            }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {HABIT_PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActive(p.id)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-full text-xs border",
              active === p.id
                ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                : "border-slate-700 text-cyan-100/50"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {active === "morning" && (
        <SupplementStack supplements={stats.supplements} onToggle={toggleSupplement} />
      )}

      <SwipeHabitList
        habits={catHabits}
        onComplete={(id) => completeHabit(id, true)}
        onSkip={(id) => {
          const h = stats.habits.find((x) => x.id === id);
          if (h) setSkipTarget({ id, name: h.name });
        }}
        onIncrement={incrementHabit}
        onCompleteCategory={completeCategory}
      />

      <p className="text-[10px] text-center text-cyan-500/30">
        Swipe right = complete · Swipe left = skip (streak shield)
      </p>

      <SkipHabitDialog
        habitName={skipTarget?.name ?? ""}
        open={!!skipTarget}
        onClose={() => setSkipTarget(null)}
        onConfirm={(reason) => {
          if (skipTarget) void skipHabit(skipTarget.id, reason);
          setSkipTarget(null);
        }}
        onSnooze={async () => {
          if (!skipTarget) return;
          await jarvisFetch("/api/habits/snooze", {
            method: "POST",
            body: JSON.stringify({ habitId: skipTarget.id }),
          });
          setSkipTarget(null);
          refetch();
        }}
      />
    </div>
  );
}
