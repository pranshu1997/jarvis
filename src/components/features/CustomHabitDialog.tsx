"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomHabitForm } from "@/components/features/CustomHabitForm";
import type { Habit } from "@/types/database";
import { cn } from "@/lib/utils";

export function CustomHabitDialog({
  habits,
  onCreated,
  className,
  label = "+ Add Custom Habit",
}: {
  habits: Habit[];
  onCreated: () => void;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn("border-cyan-500/30 text-cyan-200", className)}
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4" />
        {label}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto"
            >
              <div className="mx-4 rounded-xl border border-cyan-500/30 bg-slate-950 p-6 shadow-[0_0_40px_rgba(0,212,255,0.15)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold text-cyan-100">
                    Create Custom Habit
                  </h2>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-1 rounded-lg text-cyan-500/50 hover:text-cyan-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <CustomHabitForm
                  habits={habits}
                  onCreated={() => {
                    onCreated();
                    setOpen(false);
                  }}
                  onCancel={() => setOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
