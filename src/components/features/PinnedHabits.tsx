"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Pin, PinOff } from "lucide-react";
import { jarvisFetch } from "@/lib/api-client";
import { useGameStore } from "@/stores/game-store";
import type { Habit } from "@/types/database";

interface PinnedHabitsProps {
  onComplete: (id: string, done: boolean) => void;
}

export function PinnedHabits({ onComplete }: PinnedHabitsProps) {
  const stats = useGameStore((s) => s.stats);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("jarvis_pinned_habits");
    if (stored) setPinnedIds(JSON.parse(stored) as string[]);
  }, []);

  const pinHabit = useCallback(
    async (habitId: string) => {
      const next = pinnedIds.includes(habitId)
        ? pinnedIds.filter((id) => id !== habitId)
        : [...pinnedIds, habitId];
      setPinnedIds(next);
      localStorage.setItem("jarvis_pinned_habits", JSON.stringify(next));
      await jarvisFetch("/api/habits/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, pinned: !pinnedIds.includes(habitId) }),
      });
    },
    [pinnedIds]
  );

  if (!stats) return null;

  const pinned = stats.habits.filter(
    (h) => h.is_active && pinnedIds.includes(h.id)
  );

  if (pinned.length === 0) return null;

  return (
    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Pin className="w-3.5 h-3.5 text-purple-400" />
        <p className="text-xs uppercase tracking-[0.3em] text-purple-500/60">Pinned</p>
      </div>
      <div className="space-y-2">
        {pinned.map((h) => (
          <PinnedHabitRow
            key={h.id}
            habit={h}
            onComplete={onComplete}
            onUnpin={() => void pinHabit(h.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PinnedHabitRow({
  habit,
  onComplete,
  onUnpin,
}: {
  habit: Habit;
  onComplete: (id: string, done: boolean) => void;
  onUnpin: () => void;
}) {
  return (
    <motion.div
      layout
      className="flex items-center gap-3 py-1.5"
    >
      <button
        type="button"
        onClick={() => onComplete(habit.id, !habit.completed_today)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          habit.completed_today
            ? "bg-purple-500 border-purple-400"
            : "border-purple-500/40 hover:border-purple-400"
        }`}
      >
        {habit.completed_today && (
          <span className="text-white text-xs">✓</span>
        )}
      </button>
      <span
        className={`flex-1 text-sm ${
          habit.completed_today ? "line-through text-purple-500/40" : "text-purple-100"
        }`}
      >
        {habit.name}
      </span>
      <button
        type="button"
        onClick={onUnpin}
        className="text-purple-500/40 hover:text-purple-400"
        title="Unpin"
      >
        <PinOff className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function PinHabitButton({ habitId }: { habitId: string }) {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("jarvis_pinned_habits");
    if (stored) {
      const ids = JSON.parse(stored) as string[];
      setPinned(ids.includes(habitId));
    }
  }, [habitId]);

  const toggle = async () => {
    const stored = localStorage.getItem("jarvis_pinned_habits");
    const ids: string[] = stored ? (JSON.parse(stored) as string[]) : [];
    const next = ids.includes(habitId)
      ? ids.filter((id) => id !== habitId)
      : [...ids, habitId];
    localStorage.setItem("jarvis_pinned_habits", JSON.stringify(next));
    setPinned(!pinned);
    await jarvisFetch("/api/habits/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, pinned: !pinned }),
    });
  };

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      title={pinned ? "Unpin habit" : "Pin habit"}
      className={`transition-colors ${
        pinned ? "text-purple-400" : "text-cyan-500/30 hover:text-cyan-400"
      }`}
    >
      <Pin className="w-3.5 h-3.5" />
    </button>
  );
}
