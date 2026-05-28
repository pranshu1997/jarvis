"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Shield, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/stores/game-store";
import {
  getAtRiskHabits,
  getBriefSummary,
  getPinnedQuest,
  getPriorityHabit,
} from "@/lib/mission-brief";
import { shouldShowMissionBrief } from "@/lib/player-settings";
import { jarvisFetch } from "@/lib/api-client";

export function MissionBriefModal() {
  const stats = useGameStore((s) => s.stats);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (stats && shouldShowMissionBrief(stats)) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [stats]);

  if (!stats || !open) return null;

  const summary = getBriefSummary(stats);
  const priority = getPriorityHabit(stats);
  const pinned = getPinnedQuest(stats);
  const atRisk = getAtRiskHabits(stats);

  const dismiss = async () => {
    await jarvisFetch("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify({ missionBriefShown: true }),
    });
    setOpen(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-slate-950 p-6"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-500/50">
            Mission Brief
          </p>
          <h2 className="font-display text-2xl font-bold text-cyan-100 mt-1">
            Today&apos;s protocol
          </h2>
          <p className="text-sm text-cyan-500/50 mt-2">
            {summary.incomplete} habits left · {summary.shields} streak shield
            {summary.shields !== 1 ? "s" : ""}
          </p>

          {pinned && (
            <div className="mt-4 p-3 rounded-lg border border-purple-500/30 bg-purple-500/10">
              <p className="text-[10px] uppercase text-purple-400/60">Pinned quest</p>
              <p className="text-sm text-cyan-100">{pinned.title}</p>
            </div>
          )}

          {priority && (
            <div className="mt-3 p-3 rounded-lg border border-cyan-500/20 flex gap-3">
              <Target className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-[10px] uppercase text-cyan-500/40">Priority</p>
                <p className="font-medium text-cyan-100">{priority.name}</p>
              </div>
            </div>
          )}

          {atRisk.length > 0 && (
            <p className="mt-3 text-sm text-amber-200/80 flex gap-2">
              <Flame className="w-4 h-4 shrink-0" />
              {atRisk.length} streak(s) at risk tonight
            </p>
          )}

          <Button className="w-full mt-6" variant="hologram" onClick={() => void dismiss()}>
            <Shield className="w-4 h-4" />
            Begin mission
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
