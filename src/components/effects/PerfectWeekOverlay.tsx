"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useGameStore } from "@/stores/game-store";
import { playSound, isSoundEnabled } from "@/lib/feedback";
import { hapticPerfectDay } from "@/lib/haptics";

export function PerfectWeekOverlay() {
  const show = useGameStore((s) => s.lastPerfectWeek);
  const clear = useGameStore((s) => s.clearPerfectWeek);

  useEffect(() => {
    if (!show) return;
    playSound("category", isSoundEnabled());
    hapticPerfectDay();
    const t = setTimeout(() => clear(), 4500);
    return () => clearTimeout(t);
  }, [show, clear]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[96] flex items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={() => clear()}
        >
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center">
            <Star className="w-20 h-20 text-yellow-400 mx-auto animate-pulse" />
            <p className="font-display text-4xl font-black text-yellow-300 mt-4">
              Perfect Week
            </p>
            <p className="text-cyan-100/70 mt-2">+35% XP bonus active · +50 Shadow Coins</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
