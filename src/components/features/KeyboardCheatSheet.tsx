"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SHORTCUTS = [
  { keys: "⌘ K", action: "Command palette" },
  { keys: "1–9", action: "Complete habit by position" },
  { keys: "N", action: "Complete next habit" },
  { keys: "U", action: "Undo last habit" },
  { keys: "F", action: "Toggle focus mode" },
  { keys: "?", action: "This cheat sheet" },
  { keys: "Esc", action: "Close overlays" },
];

export function KeyboardCheatSheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-2xl p-6 max-w-sm w-full"
          >
            <h2 className="font-display text-lg font-bold text-cyan-100 mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-2">
              {SHORTCUTS.map(({ keys, action }) => (
                <div key={keys} className="flex items-center justify-between text-sm">
                  <span className="text-cyan-300/70">{action}</span>
                  <kbd className="font-mono text-xs bg-cyan-950/50 border border-cyan-500/20 rounded px-2 py-0.5 text-cyan-300">{keys}</kbd>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-cyan-500/40 mt-4 text-center">Press ? or Esc to close</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
