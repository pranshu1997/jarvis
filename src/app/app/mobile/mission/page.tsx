"use client";

import { useMemo, useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { Button } from "@/components/ui/button";
import { filterSnoozedHabits } from "@/lib/snooze-filter";
import { sortHabitsByUserOrder, getHabitSortOrder } from "@/lib/player-settings-extended";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";

export default function MobileMissionPage() {
  const { stats, completeHabit, isLoading } = useDashboard();
  const [done, setDone] = useState(false);

  const nextHabit = useMemo(() => {
    if (!stats) return null;
    const order = getHabitSortOrder(stats);
    const sorted = sortHabitsByUserOrder(stats.habits, order);
    const pool = filterSnoozedHabits(
      sorted.filter((h) => h.is_active && !h.completed_today),
      stats.profile
    );
    return pool[0] ?? null;
  }, [stats]);

  const remaining = stats?.habits.filter((h) => h.is_active && !h.completed_today).length ?? 0;
  const total = stats?.habits.filter((h) => h.is_active).length ?? 0;

  const complete = async () => {
    if (!nextHabit) return;
    await completeHabit(nextHabit.id);
    setDone(true);
    setTimeout(() => setDone(false), 800);
  };

  if (isLoading || !stats) return null;

  if (!nextHabit) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-5xl mb-4">✓</motion.div>
        <h1 className="font-display text-2xl font-bold text-cyan-100">Mission Complete</h1>
        <p className="text-cyan-500/50 mt-2 text-sm">All {total} habits done today</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col px-4 pt-8 pb-24">
      <p className="text-xs uppercase tracking-[0.4em] text-cyan-500/40 text-center">Today Mission</p>
      <p className="text-center text-cyan-500/50 text-sm mt-2">{total - remaining + 1} of {total}</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={nextHabit.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <div className="glass rounded-3xl p-8 w-full max-w-sm text-center glow-cyan">
            <p className="text-xs text-cyan-500/50 uppercase tracking-widest mb-3">{nextHabit.category_id?.replace("cat-", "") ?? "habit"}</p>
            <h1 className="font-display text-3xl font-bold text-cyan-50 leading-tight">{nextHabit.name}</h1>
            {nextHabit.description && (
              <p className="text-sm text-cyan-400/60 mt-3">{String(nextHabit.description)}</p>
            )}
            <p className="text-xs text-cyan-500/40 mt-4">{nextHabit.current_streak} day streak</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <Button
        size="lg"
        className="w-full max-w-sm mx-auto h-14 text-lg gap-2"
        onClick={complete}
      >
        {done ? <Check className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        {done ? "Done!" : "Complete Mission"}
      </Button>
    </div>
  );
}
