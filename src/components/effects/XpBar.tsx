"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/lib/utils";

interface XpBarProps {
  label: string;
  current: number;
  required: number;
  percent: number;
  level?: number;
  color?: string;
  size?: "sm" | "md" | "lg";
  showValues?: boolean;
}

export function XpBar({
  label,
  current,
  required,
  percent,
  level,
  color = "from-cyan-400 to-blue-500",
  size = "md",
  showValues = true,
}: XpBarProps) {
  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-cyan-100/80">{label}</span>
        <div className="flex items-center gap-2">
          {level !== undefined && (
            <motion.span
              key={level}
              initial={{ scale: 1.3, color: "#00d4ff" }}
              animate={{ scale: 1, color: "#67e8f9" }}
              className="font-mono text-cyan-300"
            >
              Lv.{level}
            </motion.span>
          )}
          {showValues && (
            <span className="font-mono text-cyan-400/60">
              {formatNumber(current)} / {formatNumber(required)} XP
            </span>
          )}
        </div>
      </div>
      <div className="relative">
        <Progress
          value={percent}
          className={heights[size]}
          indicatorClassName={`bg-gradient-to-r ${color}`}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ width: "30%" }}
        />
      </div>
    </div>
  );
}
