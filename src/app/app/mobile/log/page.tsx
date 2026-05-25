"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HabitList } from "@/components/features/HabitList";
import { useDashboard } from "@/hooks/useDashboard";
import { useGameStore } from "@/stores/game-store";
import { cn } from "@/lib/utils";

const TABS = ["physical", "mental", "awareness", "vitality"] as const;

export default function MobileLogPage() {
  const [active, setActive] = useState<(typeof TABS)[number]>("physical");
  const { stats, completeHabit } = useDashboard();
  const isLoading = useGameStore((s) => s.isLoading);

  if (isLoading || !stats) return null;

  return (
    <div className="space-y-4 pt-4">
      <h2 className="font-display text-xl font-bold text-cyan-100">
        Rapid Log
      </h2>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {TABS.map((tab) => {
          const cat = stats.categories.find((c) => c.slug === tab);
          return (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActive(tab)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border capitalize transition-all",
                active === tab
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                  : "border-slate-700 text-cyan-100/50"
              )}
              style={
                active === tab && cat
                  ? { boxShadow: `0 0 15px ${cat.color}40` }
                  : undefined
              }
            >
              {cat?.name ?? tab}
            </motion.button>
          );
        })}
      </div>

      <HabitList
        habits={stats.habits}
        categorySlug={active}
        onToggle={completeHabit}
      />
    </div>
  );
}
