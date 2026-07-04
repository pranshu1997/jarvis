"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";

export function ComboTrail() {
  const combo = useGameStore((s) => s.stats?.profile?.settings?.combo_count as number | undefined) ?? 0;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (combo >= 3) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(t);
    }
    setShow(false);
  }, [combo]);

  if (combo < 3) return null;

  const intensity = combo >= 10 ? "text-orange-400" : combo >= 5 ? "text-yellow-400" : "text-cyan-400";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`fixed bottom-24 right-4 z-50 pointer-events-none ${intensity}`}
        >
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(combo, 5) }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="text-2xl"
              >
                🔥
              </motion.span>
            ))}
            <span className="font-mono text-sm font-bold ml-1">×{combo}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
