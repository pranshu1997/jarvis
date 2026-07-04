"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

type SkipReason = "rest" | "sick" | "travel" | "busy" | "forgot";

const REASONS: { id: SkipReason; label: string; emoji: string }[] = [
  { id: "rest", label: "Rest day", emoji: "💤" },
  { id: "sick", label: "Sick", emoji: "🤒" },
  { id: "travel", label: "Travel", emoji: "✈️" },
  { id: "busy", label: "Busy", emoji: "⏰" },
  { id: "forgot", label: "Forgot", emoji: "🧠" },
];

export function SkipHabitDialog({
  habitName,
  open,
  onClose,
  onConfirm,
  onSnooze,
}: {
  habitName: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: SkipReason) => void;
  onSnooze?: () => void;
}) {
  const [reason, setReason] = useState<SkipReason>("rest");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[96] flex items-center justify-center bg-black/70 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-cyan-500/30 bg-slate-950 p-5"
          >
            <div className="flex items-center gap-2 text-cyan-300">
              <Shield className="w-5 h-5" />
              <h3 className="font-display font-semibold">Use streak shield?</h3>
            </div>
            <p className="text-sm text-cyan-500/50 mt-2">
              Skip <strong className="text-cyan-200">{habitName}</strong> without
              breaking your streak. Uses 1 shield this week.
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {REASONS.slice(0, 3).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReason(r.id)}
                  className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs border gap-1 ${
                    reason === r.id
                      ? "border-cyan-400 bg-cyan-500/15 text-cyan-200"
                      : "border-slate-700 text-cyan-100/60 hover:border-slate-600"
                  }`}
                >
                  <span className="text-base">{r.emoji}</span>
                  {r.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {REASONS.slice(3).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReason(r.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border ${
                    reason === r.id
                      ? "border-cyan-400 bg-cyan-500/15 text-cyan-200"
                      : "border-slate-700 text-cyan-100/60 hover:border-slate-600"
                  }`}
                >
                  <span>{r.emoji}</span>
                  {r.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              {onSnooze && (
                <Button variant="outline" className="flex-1" onClick={onSnooze}>
                  Snooze
                </Button>
              )}
              <Button
                variant="hologram"
                className="flex-1"
                onClick={() => onConfirm(reason)}
              >
                Skip
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
