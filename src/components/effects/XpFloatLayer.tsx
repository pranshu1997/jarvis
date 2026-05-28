"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";

export function XpFloatLayer() {
  const animations = useGameStore((s) => s.xpAnimations);
  const remove = useGameStore((s) => s.removeXpAnimation);

  return (
    <div className="fixed inset-0 pointer-events-none z-[90] overflow-hidden">
      <AnimatePresence>
        {animations.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -80, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            onAnimationComplete={() => remove(a.id)}
            className="absolute font-display font-bold text-2xl text-cyan-300 drop-shadow-[0_0_12px_rgba(0,212,255,0.9)]"
            style={{
              left: `${a.x}%`,
              top: `${a.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            +{a.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
