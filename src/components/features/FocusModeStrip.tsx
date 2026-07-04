"use client";

import { useGameStore } from "@/stores/game-store";
import { HabitList } from "@/components/features/HabitList";
import { SupplementStack } from "@/components/features/SupplementStack";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useFocusMode } from "@/contexts/FocusModeContext";

export function FocusModeToggle({ className }: { className?: string }) {
  const { focusMode, toggleFocusMode } = useFocusMode();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={toggleFocusMode}
    >
      {focusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      {focusMode ? "Full HUD" : "Focus mode"}
    </Button>
  );
}

export function FocusModePanel({
  onComplete,
  onIncrement,
  onSupplement,
}: {
  onComplete: (id: string, done: boolean) => void;
  onIncrement?: (id: string, delta: number) => void;
  onSupplement: (id: string, taken: boolean) => void;
}) {
  const stats = useGameStore((s) => s.stats);
  const { focusMode } = useFocusMode();

  if (!stats || !focusMode) return null;

  const next = stats.habits
    .filter(
      (h) =>
        h.is_active &&
        !h.completed_today &&
        !(h.metadata as { skipped_today?: boolean }).skipped_today
    )
    .slice(0, 3);

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-500/50">
        Focus — next 3
      </p>
      <HabitList
        habits={next}
        allHabits={stats.habits}
        onToggle={onComplete}
        onIncrement={onIncrement}
        compact
      />
      <SupplementStack
        supplements={stats.supplements.filter((s) => !s.taken_today).slice(0, 3)}
        onToggle={onSupplement}
      />
    </div>
  );
}
