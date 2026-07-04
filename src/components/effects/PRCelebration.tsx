"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { useGameStore } from "@/stores/game-store";
import { playSound, isSoundEnabled } from "@/lib/feedback";
import { hapticRankUp } from "@/lib/haptics";

export function PRCelebration() {
  const lastPr = useGameStore((s) => s.lastPr);
  const clearPr = useGameStore((s) => s.clearPr);

  useEffect(() => {
    if (!lastPr) return;
    playSound("levelup", isSoundEnabled());
    hapticRankUp();
    const t = setTimeout(() => clearPr(), 3500);
    return () => clearTimeout(t);
  }, [lastPr, clearPr]);

  return (
    <AnimatePresence>
      {lastPr && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center"
          >
            <Trophy className="w-16 h-16 text-amber-400 mx-auto drop-shadow-[0_0_24px_rgba(251,191,36,0.8)]" />
            <p className="font-display text-4xl font-black text-amber-300 mt-4">
              NEW PR!
            </p>
            <p className="text-cyan-100/80 mt-2">{lastPr.exerciseName}</p>
            {lastPr.weight != null && (
              <p className="font-mono text-2xl text-cyan-300 mt-1">
                {lastPr.weight} kg
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
