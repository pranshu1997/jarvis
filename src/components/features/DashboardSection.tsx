"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  id: string;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  badge?: ReactNode;
}

export function DashboardSection({
  id,
  title,
  defaultOpen = true,
  children,
  className,
  badge,
}: DashboardSectionProps) {
  const storageKey = `jarvis_section_${id}`;
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) setOpen(stored === "1");
  }, [storageKey]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      localStorage.setItem(storageKey, next ? "1" : "0");
      return next;
    });
  }, [storageKey]);

  return (
    <div className={cn("space-y-0", className)}>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center justify-between w-full group mb-3"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-display text-sm uppercase tracking-[0.3em] text-cyan-500/50 group-hover:text-cyan-400 transition-colors">
            {title}
          </h3>
          {badge}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-cyan-500/40 transition-transform duration-200",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
