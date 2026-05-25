"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";

export function LevelUpOverlay() {
  const { lastLevelUp, clearLevelUp } = useGameStore();

  return (
    <AnimatePresence>
      {lastLevelUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={clearLevelUp}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="text-center"
          >
            <motion.p
              className="text-sm uppercase tracking-[0.5em] text-cyan-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              Level Up
            </motion.p>
            <motion.h1
              className="mt-4 font-display text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 to-blue-500 drop-shadow-[0_0_40px_rgba(0,212,255,0.8)]"
              animate={{
                textShadow: [
                  "0 0 40px rgba(0,212,255,0.8)",
                  "0 0 80px rgba(0,212,255,1)",
                  "0 0 40px rgba(0,212,255,0.8)",
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {lastLevelUp}
            </motion.h1>
            <p className="mt-4 text-cyan-300/60 text-sm">Tap to dismiss</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
