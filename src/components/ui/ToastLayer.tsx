"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/stores/toast-store";
import { cn } from "@/lib/utils";

export function ToastLayer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed top-4 right-4 z-[95] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className={cn(
              "px-4 py-3 rounded-xl border backdrop-blur-xl text-sm font-medium shadow-lg",
              t.type === "error" && "border-red-500/40 bg-red-950/80 text-red-200",
              t.type === "success" && "border-cyan-500/40 bg-slate-900/90 text-cyan-100",
              t.type === "celebration" && "border-amber-500/40 bg-amber-950/80 text-amber-100 glow-cyan",
              t.type === "info" && "border-slate-600 bg-slate-900/90 text-cyan-100/80"
            )}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
