"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Timer, Pause, Play, RotateCcw } from "lucide-react";
import { hapticSuccess } from "@/lib/feedback";

const PRESETS = [60, 90, 120, 180];

export function RestTimer() {
  const [seconds, setSeconds] = useState(90);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || remaining === null) return;
    if (remaining <= 0) {
      hapticSuccess();
      setRunning(false);
      setRemaining(null);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => (r ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);

  const start = useCallback((sec: number) => {
    setSeconds(sec);
    setRemaining(sec);
    setRunning(true);
  }, []);

  const toggle = () => setRunning((r) => !r);
  const reset = () => {
    setRunning(false);
    setRemaining(null);
  };

  const pct =
    remaining !== null && seconds > 0
      ? ((seconds - remaining) / seconds) * 100
      : 0;

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-cyan-300">
        <Timer className="w-4 h-4" />
        Rest timer
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => start(p)}
          >
            {p}s
          </Button>
        ))}
      </div>
      <AnimatePresence>
        {remaining !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full bg-cyan-400"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="font-display text-3xl font-bold text-cyan-100 text-center tabular-nums">
              {remaining}s
            </p>
            <div className="flex justify-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={toggle}>
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={reset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
