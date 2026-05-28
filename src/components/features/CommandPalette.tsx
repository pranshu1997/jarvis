"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const stats = useGameStore((s) => s.stats);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const habits = stats?.habits.filter((h) =>
    h.name.toLowerCase().includes(query.toLowerCase())
  ) ?? [];

  const logHabit = useCallback(
    async (habitId: string) => {
      await fetch("/api/habits/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, completed: true }),
      });
      setOpen(false);
      setQuery("");
      window.location.reload();
    },
    []
  );

  if (typeof window !== "undefined" && window.innerWidth < 768) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh] px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-lg glass rounded-xl overflow-hidden border border-cyan-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Log habit, go to page… (⌘K)"
              className="w-full px-4 py-4 bg-transparent text-cyan-50 placeholder:text-cyan-500/40 outline-none border-b border-cyan-500/20"
            />
            <div className="max-h-64 overflow-y-auto p-2">
              {habits.slice(0, 8).map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => logHabit(h.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-500/10 text-sm text-cyan-100"
                >
                  Complete: {h.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  router.push("/app/desktop/dashboard");
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-500/10 text-sm text-cyan-100/60"
              >
                → Command Center
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push("/app/desktop/workout");
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-500/10 text-sm text-cyan-100/60"
              >
                → Workout System
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
