"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { getComboCount } from "@/lib/player-settings";
import type { DashboardStats } from "@/types/database";

export function ComboMeter({ stats }: { stats: DashboardStats }) {
  const combo = getComboCount(stats);
  if (combo < 1) return null;

  const multiplier =
    combo >= 10 ? 2 : combo >= 7 ? 1.75 : combo >= 5 ? 1.5 : combo >= 3 ? 1.25 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/10"
    >
      <Zap className="w-4 h-4 text-cyan-400" />
      <span className="text-sm font-mono text-cyan-200">
        {combo}× combo · {multiplier.toFixed(2)}× XP
      </span>
    </motion.div>
  );
}
