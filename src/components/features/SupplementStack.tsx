"use client";

import { motion } from "framer-motion";
import { Pill } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Supplement } from "@/types/database";

interface SupplementStackProps {
  supplements: Supplement[];
  onToggle: (id: string, taken: boolean) => void;
  compact?: boolean;
}

export function SupplementStack({
  supplements,
  onToggle,
  compact = false,
}: SupplementStackProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Pill className="w-4 h-4 text-emerald-400" />
        <h3 className="font-display text-xs uppercase tracking-[0.3em] text-cyan-500/50">
          Vitality Stack
        </h3>
      </div>
      <div className={cn("flex gap-2", compact ? "flex-wrap" : "grid grid-cols-5 gap-2")}>
        {supplements.map((sup) => (
          <motion.button
            key={sup.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => onToggle(sup.id, !sup.taken_today)}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border p-2 min-w-[4rem] transition-all",
              sup.taken_today
                ? "border-emerald-400/50 bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : "border-slate-700 bg-slate-900/50 hover:border-emerald-500/30"
            )}
            title={sup.name}
          >
            <span
              className={cn(
                "text-[10px] font-medium text-center leading-tight",
                sup.taken_today ? "text-emerald-200" : "text-cyan-100/50"
              )}
            >
              {sup.name.split(" ")[0]}
            </span>
            {sup.taken_today && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-[9px] text-emerald-400 mt-0.5"
              >
                ✓
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
