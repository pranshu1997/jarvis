"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { RankBadge } from "@/components/shared/RankBadge";
import type { RankTier } from "@/types/database";

export function RankUpOverlay() {
  const { lastRankUp, clearRankUp } = useGameStore();

  return (
    <AnimatePresence>
      {lastRankUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[101] flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={clearRankUp}
        >
          <motion.div
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <p className="text-sm uppercase tracking-[0.5em] text-amber-400">
              Rank promotion
            </p>
            <div className="mt-6 flex justify-center scale-150">
              <RankBadge rank={lastRankUp as RankTier} size="lg" />
            </div>
            <p className="mt-8 text-cyan-300/60 text-sm">Tap to dismiss</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
