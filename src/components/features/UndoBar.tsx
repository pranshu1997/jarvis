"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/stores/game-store";
import { jarvisFetch } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast-store";
import { RotateCcw } from "lucide-react";

export function UndoBar({ onUndone }: { onUndone?: () => void }) {
  const undoUntil = useGameStore((s) => s.undoUntil);
  const undoLabel = useGameStore((s) => s.undoLabel);
  const [visible, setVisible] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!undoUntil) {
      setVisible(false);
      return;
    }
    const now = Date.now();
    if (now >= undoUntil) {
      setVisible(false);
      return;
    }
    setVisible(true);
    setRemaining(Math.ceil((undoUntil - now) / 1000));

    const t = setInterval(() => {
      const left = undoUntil - Date.now();
      if (left <= 0) {
        setVisible(false);
        setRemaining(0);
        useGameStore.getState().setUndoUntil(null);
      } else {
        setRemaining(Math.ceil(left / 1000));
      }
    }, 500);
    return () => clearInterval(t);
  }, [undoUntil]);

  const undo = async () => {
    const res = await jarvisFetch("/api/habits/undo", { method: "POST" });
    if (!res.ok) {
      useToastStore.getState().show("Undo expired", "error");
      return;
    }
    useGameStore.getState().setUndoUntil(null);
    useToastStore
      .getState()
      .show(undoLabel ? `Undone: ${undoLabel}` : "Undone", "info");
    const dash = await jarvisFetch("/api/dashboard");
    if (dash.ok) {
      useGameStore.getState().setStats(await dash.json());
    }
    onUndone?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[94] md:bottom-8"
        >
          <div className="flex items-center gap-2 glass rounded-xl border border-cyan-500/30 px-4 py-2 shadow-lg">
            <span className="text-xs text-cyan-500/60 font-mono w-6 text-right">
              {remaining}s
            </span>
            <div className="w-px h-4 bg-cyan-500/20" />
            <span className="text-sm text-cyan-100/80">
              {undoLabel ? `Completed: ${undoLabel}` : "Habit logged"}
            </span>
            <Button
              variant="hologram"
              size="sm"
              onClick={() => void undo()}
              className="flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              Undo
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
