"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";

export function RankUpCinematic() {
  const rankUp = useGameStore((s) => s.lastRankUp);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (rankUp && (rankUp === "S" || rankUp === "MONARCH")) {
      setOpen(true);
      const t = setTimeout(() => setOpen(false), 4000);
      return () => clearTimeout(t);
    }
  }, [rankUp]);

  if (!rankUp || !open) return null;

  const lines: Record<string, string> = {
    S: "The shadows recognize your strength. S-Rank achieved.",
    MONARCH: "You stand above all hunters. The Monarch's throne is yours.",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="text-center px-8"
        >
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs uppercase tracking-[0.5em] text-cyan-500/60 mb-4"
          >
            Rank Ascension
          </motion.p>
          <motion.h1
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="font-display text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 to-cyan-600"
          >
            {rankUp}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-cyan-300/70 mt-6 text-sm max-w-xs mx-auto italic"
          >
            &ldquo;{lines[rankUp] ?? "Your power grows."}&rdquo;
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
