"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CoinEvent {
  amount: number;
  reason: string;
  id: number;
}

export function CoinEarnToast() {
  const [events, setEvents] = useState<CoinEvent[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ amount: number; reason: string }>).detail;
      if (!detail?.amount || detail.amount <= 0) return;
      const id = Date.now();
      setEvents((prev) => [...prev, { ...detail, id }]);
      setTimeout(() => {
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
      }, 2500);
    };
    window.addEventListener("jarvis-coin-earned", handler);
    return () => window.removeEventListener("jarvis-coin-earned", handler);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-[90] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {events.map((ev) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-4 py-2 backdrop-blur-sm"
          >
            <p className="text-sm font-mono font-bold text-amber-300">+{ev.amount} 🪙</p>
            <p className="text-[10px] text-amber-400/60">{ev.reason}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
