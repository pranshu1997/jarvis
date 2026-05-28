"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

const DEBRIEF_KEY = "jarvis_debrief_shown";

export function DebriefModal() {
  const stats = useGameStore((s) => s.stats);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!stats) return;
    const hour = new Date().getHours();
    const today = new Date().toISOString().slice(0, 10);
    const shown = sessionStorage.getItem(`${DEBRIEF_KEY}-${today}`);
    const dc = stats.dailyCompletion;
    const allDone =
      dc &&
      dc.completed_habits >= dc.total_habits &&
      dc.total_habits > 0;

    if ((hour >= 21 || allDone) && !shown) {
      const t = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(t);
    }
  }, [stats]);

  if (!stats?.dailyCompletion) return null;

  const dc = stats.dailyCompletion;
  const todayXp =
    stats.todayXpEarned ?? dc.total_xp ?? 0;

  const dismiss = () => {
    const today = new Date().toISOString().slice(0, 10);
    sessionStorage.setItem(`${DEBRIEF_KEY}-${today}`, "1");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[85] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-2xl p-6 max-w-md w-full glow-cyan"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-500/50">
              End of Day Debrief
            </p>
            <h2 className="font-display text-2xl font-bold text-cyan-100 mt-2">
              Mission Report
            </h2>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-xs text-cyan-500/50">Habits</p>
                <p className="text-xl font-mono text-cyan-300">
                  {dc.completed_habits}/{dc.total_habits}
                </p>
              </div>
              <div>
                <p className="text-xs text-cyan-500/50">XP Today</p>
                <p className="text-xl font-mono text-cyan-300">
                  +{formatNumber(todayXp)}
                </p>
              </div>
              <div>
                <p className="text-xs text-cyan-500/50">Player Level</p>
                <p className="text-xl font-mono text-cyan-300">
                  {stats.profile.player_level}
                </p>
              </div>
              <div>
                <p className="text-xs text-cyan-500/50">Perfect Day</p>
                <p className="text-xl font-mono text-cyan-300">
                  {dc.perfect_day ? "YES" : "—"}
                </p>
              </div>
            </div>

            <p className="text-sm text-cyan-100/50 mt-4">
              {dc.perfect_day
                ? "Flawless execution. You are evolving."
                : "Tomorrow is another dungeon. Rest well, Hunter."}
            </p>

            <Button className="w-full mt-6" onClick={dismiss}>
              Dismiss
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
