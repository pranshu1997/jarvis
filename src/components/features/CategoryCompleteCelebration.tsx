"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  categoryName: string | null;
  onDismiss: () => void;
}

export function CategoryCompleteCelebration({ categoryName, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {categoryName && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:max-w-sm z-[88] glass rounded-xl p-4 border border-cyan-400/40 glow-cyan"
          onClick={onDismiss}
        >
          <p className="text-xs uppercase tracking-widest text-cyan-400">
            Category Complete
          </p>
          <p className="font-display font-bold text-lg text-cyan-100 capitalize mt-1">
            {categoryName} Dominion Secured
          </p>
          <p className="text-xs text-cyan-500/50 mt-1">+25% bonus applied</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
