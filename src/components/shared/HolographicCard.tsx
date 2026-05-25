"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glowColor?: string;
  delay?: number;
}

export function HolographicCard({
  children,
  className,
  onClick,
  glowColor = "rgba(0,212,255,0.15)",
  delay = 0,
}: HolographicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: onClick ? 1.02 : 1, y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "relative rounded-xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl p-4",
        "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-cyan-500/5 before:to-purple-500/5 before:pointer-events-none",
        onClick && "cursor-pointer",
        className
      )}
      style={{ boxShadow: `0 0 30px ${glowColor}` }}
    >
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      {children}
    </motion.div>
  );
}
