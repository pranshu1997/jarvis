"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { randomLevelQuote } from "@/lib/voice-lines";

export function LevelUpVoiceLine() {
  const levelUp = useGameStore((s) => s.lastLevelUp);
  const [open, setOpen] = useState(false);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    if (levelUp) {
      setQuote(randomLevelQuote());
      setOpen(true);
      const t = setTimeout(() => setOpen(false), 3500);
      return () => clearTimeout(t);
    }
  }, [levelUp]);

  return (
    <AnimatePresence>
      {open && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-32 left-0 right-0 text-center text-sm italic text-cyan-300/80 px-8 pointer-events-none z-[80]"
        >
          &ldquo;{quote}&rdquo;
        </motion.p>
      )}
    </AnimatePresence>
  );
}
