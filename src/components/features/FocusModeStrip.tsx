"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { HabitList } from "@/components/features/HabitList";
import { SupplementStack } from "@/components/features/SupplementStack";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

const FOCUS_KEY = "jarvis_focus_mode";

export function getFocusMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(FOCUS_KEY) === "1";
}

export function setFocusMode(on: boolean) {
  localStorage.setItem(FOCUS_KEY, on ? "1" : "0");
}

export function FocusModeToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(getFocusMode());
  }, []);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={() => {
        setFocusMode(!on);
        window.location.reload();
      }}
    >
      {on ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      {on ? "Full HUD" : "Focus mode"}
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
  const [focusOn, setFocusOn] = useState(false);

  useEffect(() => {
    setFocusOn(getFocusMode());
  }, []);

  if (!stats || !focusOn) return null;

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
