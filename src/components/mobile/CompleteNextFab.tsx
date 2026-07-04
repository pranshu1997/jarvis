"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { filterSnoozedHabits } from "@/lib/snooze-filter";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export function CompleteNextFab() {
  const { stats, completeHabit } = useDashboard();
  if (!stats) return null;

  const visible = filterSnoozedHabits(
    stats.habits.filter((h) => h.is_active && !h.completed_today),
    stats.profile
  );
  const next = visible[0];
  if (!next) return null;

  return (
    <motion.button
      type="button"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={() => void completeHabit(next.id, true)}
      className="fixed bottom-24 right-4 z-[70] flex items-center gap-2 px-4 py-3 rounded-full bg-cyan-500 text-slate-900 font-medium text-sm shadow-lg shadow-cyan-500/30"
    >
      <Check className="w-4 h-4" />
      {next.name}
    </motion.button>
  );
}
