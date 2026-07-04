"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { STREAK_MILESTONES } from "@/lib/streak-milestones";

export function StreakMilestoneToast() {
  const stats = useGameStore((s) => s.stats);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!stats) return;
    for (const habit of stats.habits) {
      if (!habit.is_active || !habit.completed_today) continue;
      if (STREAK_MILESTONES.includes(habit.current_streak)) {
        const key = `milestone_${habit.id}_${habit.current_streak}`;
        if (sessionStorage.getItem(key)) continue;
        sessionStorage.setItem(key, "1");
        setMsg(`${habit.current_streak}-day streak on ${habit.name}!`);
        const t = setTimeout(() => setMsg(null), 4000);
        return () => clearTimeout(t);
      }
    }
  }, [stats]);

  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-28 left-4 right-4 z-[88] rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-3 text-center text-sm text-amber-200 backdrop-blur-sm"
        >
          🔥 {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
