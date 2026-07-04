"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";

export function SeasonalEventBanner() {
  const meta = useGameStore((s) => s.stats?.meta as { seasonalEvent?: { title: string; description: string; subtitle?: string } | null } | undefined);
  const event = meta?.seasonalEvent;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!event) return;
    const key = `jarvis_seasonal_${event.title}`;
    setDismissed(sessionStorage.getItem(key) === "1");
  }, [event]);

  if (!event || dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem(`jarvis_seasonal_${event.title}`, "1");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="mx-4 mt-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 flex items-start justify-between gap-3"
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-purple-400/70">Seasonal Event</p>
          <p className="text-sm font-semibold text-purple-100">{event.title}</p>
          <p className="text-xs text-purple-300/70 mt-0.5">{event.description}</p>
        </div>
        <button type="button" onClick={dismiss} className="text-purple-400/50 hover:text-purple-300 text-xs shrink-0">
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
