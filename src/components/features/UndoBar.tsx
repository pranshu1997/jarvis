"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/stores/game-store";
import { jarvisFetch } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast-store";

export function UndoBar({ onUndone }: { onUndone?: () => void }) {
  const undoUntil = useGameStore((s) => s.undoUntil);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!undoUntil) {
      setVisible(false);
      return;
    }
    setVisible(Date.now() < undoUntil);
    const t = setInterval(() => {
      if (Date.now() >= undoUntil) {
        setVisible(false);
        useGameStore.getState().setUndoUntil(null);
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
    useToastStore.getState().show("Undone", "info");
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
          <Button variant="hologram" size="sm" onClick={() => void undo()}>
            Undo last action
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
