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

  const incomplete = stats.habits.filter((h) => h.is_active && !h.completed_today);
  const tomorrowPriority = incomplete[0]?.name ?? "Maintain your streak";
  const intention = (stats.meta as { todayIntention?: string })?.todayIntention;
  const dailyWin = (stats.meta as { dailyWin?: string })?.dailyWin;

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

            {intention && (
              <p className="text-sm text-cyan-200/70 mt-4 italic border-l-2 border-cyan-500/30 pl-3">
                Today&apos;s intention: &ldquo;{intention}&rdquo;
              </p>
            )}

            {dailyWin && (
              <p className="text-sm text-amber-200/70 mt-4 border-l-2 border-amber-500/30 pl-3">
                Today&apos;s win: &ldquo;{dailyWin}&rdquo;
              </p>
            )}

            <div className="mt-4 rounded-xl border border-cyan-500/15 bg-cyan-950/30 p-3 space-y-2">
              <p className="text-xs uppercase tracking-widest text-cyan-500/40">Evening Review</p>
              <p className="text-xs text-cyan-300/70">
                <span className="text-emerald-400/80">Went well:</span>{" "}
                {dc.completed_habits} habits · +{formatNumber(todayXp)} XP
              </p>
              {incomplete.length > 0 && (
                <p className="text-xs text-cyan-300/70">
                  <span className="text-amber-400/80">Slipped:</span>{" "}
                  {incomplete.map((h) => h.name).slice(0, 3).join(", ")}
                  {incomplete.length > 3 ? ` +${incomplete.length - 3} more` : ""}
                </p>
              )}
              <p className="text-xs text-cyan-200/80">
                <span className="text-cyan-400/80">Tomorrow priority:</span> {tomorrowPriority}
              </p>
            </div>

            <Button className="w-full mt-6" onClick={dismiss}>
              Dismiss
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
