"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PlayerHeader } from "@/components/features/PlayerHeader";
import { QuestPanel } from "@/components/features/QuestPanel";
import { HabitList } from "@/components/features/HabitList";
import { useDashboard } from "@/hooks/useDashboard";
import { useGameStore } from "@/stores/game-store";
import { Flame, Zap } from "lucide-react";

export default function MobileDashboard() {
  const { stats, completeHabit } = useDashboard();
  const isLoading = useGameStore((s) => s.isLoading);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="font-display text-cyan-400"
        >
          Syncing HUD...
        </motion.p>
      </div>
    );
  }

  const dailyQuests = stats.quests.filter((q) => q.quest_type === "daily");
  const incomplete = stats.habits.filter((h) => !h.completed_today);

  return (
    <div className="space-y-6 pt-4">
      <PlayerHeader profile={stats.profile} variant="mobile" />

      {stats.dailyCompletion && (
        <motion.div
          className="glass rounded-2xl p-4 flex items-center justify-between"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-400/50 flex items-center justify-center glow-cyan">
              <span className="font-display font-bold text-cyan-300">
                {Math.round(
                  (stats.dailyCompletion.completed_habits /
                    stats.dailyCompletion.total_habits) *
                    100
                )}
                %
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-100">Daily Protocol</p>
              <p className="text-xs text-cyan-500/50">
                {stats.dailyCompletion.completed_habits} habits complete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <Zap className="w-4 h-4" />
            <span className="font-mono text-sm">
              +{stats.dailyCompletion.total_xp}
            </span>
          </div>
        </motion.div>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-xs uppercase tracking-[0.3em] text-cyan-500/50">
            Daily Quests
          </h3>
          <Flame className="w-4 h-4 text-orange-400" />
        </div>
        <QuestPanel quests={dailyQuests.slice(0, 3)} compact />
      </section>

      <section>
        <h3 className="font-display text-xs uppercase tracking-[0.3em] text-cyan-500/50 mb-3">
          Quick Complete — {incomplete.length} remaining
        </h3>
        <AnimatePresence mode="popLayout">
          <HabitList
            habits={incomplete.slice(0, 8)}
            onToggle={completeHabit}
            compact
          />
        </AnimatePresence>
      </section>
    </div>
  );
}
