"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import { useGameStore } from "@/stores/game-store";
import { playSound, isSoundEnabled } from "@/lib/feedback";
import { hapticSuccess } from "@/lib/haptics";

export function PhoenixCeremony() {
  const show = useGameStore((s) => s.lastPhoenix);
  const clear = useGameStore((s) => s.clearPhoenix);

  useEffect(() => {
    if (!show) return;
    playSound("quest", isSoundEnabled());
    hapticSuccess();
    const t = setTimeout(() => clear(), 4000);
    return () => clearTimeout(t);
  }, [show, clear]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[96] flex items-center justify-center bg-black/75 backdrop-blur-sm"
          onClick={() => clear()}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="text-center px-6"
          >
            <Flame className="w-16 h-16 text-orange-400 mx-auto drop-shadow-[0_0_24px_rgba(251,146,60,0.8)]" />
            <p className="font-display text-3xl font-black text-orange-300 mt-4">
              Phoenix Rising
            </p>
            <p className="text-cyan-100/70 mt-2 text-sm">
              Streak restored. Resilience +1. The hunt continues.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
