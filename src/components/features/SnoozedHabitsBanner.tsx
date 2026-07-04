"use client";

import { useGameStore } from "@/stores/game-store";
import { Moon } from "lucide-react";

export function SnoozedHabitsBanner() {
  const count = useGameStore((s) => (s.stats?.meta as { snoozedCount?: number })?.snoozedCount) ?? 0;
  if (count === 0) return null;

  return (
    <div className="rounded-lg border border-purple-500/25 bg-purple-500/10 px-3 py-2 text-xs text-purple-200 flex items-center gap-2">
      <Moon className="w-3.5 h-3.5 shrink-0" />
      {count} habit{count > 1 ? "s" : ""} snoozed until tomorrow
    </div>
  );
}
