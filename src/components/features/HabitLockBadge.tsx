"use client";

import { useGameStore } from "@/stores/game-store";
import { isHabitUnlocked } from "@/lib/habit-dependencies";
import { Lock } from "lucide-react";
import type { Habit } from "@/types/database";

export function HabitLockBadge({ habit }: { habit: Habit }) {
  const stats = useGameStore((s) => s.stats);
  if (!stats || isHabitUnlocked(stats, habit)) return null;

  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400/70" title="Complete dependency first">
      <Lock className="w-3 h-3" />
      Locked
    </span>
  );
}
