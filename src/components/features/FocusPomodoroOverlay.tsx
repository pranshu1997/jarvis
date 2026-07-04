"use client";

import { useState, useEffect, useCallback } from "react";
import { useFocusMode } from "@/contexts/FocusModeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, X } from "lucide-react";

const DURATIONS = [15, 25, 45];

export function FocusPomodoroOverlay() {
  const { focusMode } = useFocusMode();
  const [open, setOpen] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (focusMode && !open) setOpen(true);
  }, [focusMode, open]);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [running, seconds]);

  const start = useCallback((min: number) => {
    setSeconds(min * 60);
    setRunning(true);
  }, []);

  if (!open) return null;

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <div className="glass rounded-2xl p-8 max-w-sm w-full text-center relative">
          <button type="button" onClick={() => { setOpen(false); setRunning(false); }} className="absolute top-3 right-3 text-cyan-500/40 hover:text-cyan-300">
            <X className="w-5 h-5" />
          </button>
          <Timer className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest text-cyan-500/50 mb-2">Focus protocol</p>
          <p className="font-mono text-5xl font-bold text-cyan-100 mb-6">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </p>
          {!running && (
            <div className="flex justify-center gap-2 mb-4">
              {DURATIONS.map((d) => (
                <button key={d} type="button" onClick={() => start(d)} className="text-xs px-3 py-1.5 rounded-full border border-cyan-500/30 text-cyan-300">
                  {d}m
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="text-sm px-6 py-2 rounded-full bg-cyan-500 text-slate-900 font-medium"
          >
            {running ? "Pause" : seconds < 25 * 60 ? "Resume" : "Start 25m"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
