"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { AlertTriangle } from "lucide-react";

export function ProactiveNudgeBanner() {
  const stats = useGameStore((s) => s.stats);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!stats) return;
    const hour = new Date().getHours();
    if (hour >= 12) return;

    const meta = stats.meta as { stallingCategories?: string[]; atRiskHabits?: number } | undefined;
    const stalling = meta?.stallingCategories ?? [];
    const today = new Date().toISOString().slice(0, 10);
    const dismissed = localStorage.getItem(`jarvis_nudge_${today}`);

    if (dismissed) return;

    if (stalling.length > 0) {
      setMessage(`${stalling[0]!.charAt(0).toUpperCase()}${stalling[0]!.slice(1)} stalling — complete a habit before noon`);
      setVisible(true);
    } else if ((meta?.atRiskHabits ?? 0) > 0) {
      setMessage(`${meta!.atRiskHabits} habit(s) at risk tonight — get ahead now`);
      setVisible(true);
    }
  }, [stats]);

  if (!visible) return null;

  const dismiss = () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`jarvis_nudge_${today}`, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 flex items-center gap-3"
      >
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-xs text-amber-100 flex-1">{message}</p>
        <button type="button" onClick={dismiss} className="text-amber-400/50 hover:text-amber-300 text-xs">✕</button>
      </motion.div>
    </AnimatePresence>
  );
}
