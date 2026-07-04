"use client";

import { useEffect, useCallback } from "react";
import { useGameStore } from "@/stores/game-store";
import { jarvisFetch } from "@/lib/api-client";
import { useFocusMode } from "@/contexts/FocusModeContext";
import { useToastStore } from "@/stores/toast-store";
import { filterSnoozedHabits } from "@/lib/snooze-filter";

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

export function useKeyboardShortcuts({ enabled = true }: UseKeyboardShortcutsOptions = {}) {
  const { toggleFocusMode } = useFocusMode();

  const refetch = useCallback(async () => {
    const dash = await jarvisFetch("/api/dashboard");
    if (dash.ok) {
      useGameStore.getState().setStats(await dash.json());
    }
  }, []);

  const completeHabitById = useCallback(
    async (habitId: string, habitName: string) => {
      useToastStore.getState().show(`Completing: ${habitName}`, "info");
      useGameStore.getState().setUndoUntil(Date.now() + 30_000, habitName);
      useGameStore.getState().toggleHabit(habitId);

      const res = await jarvisFetch("/api/habits/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, completed: true }),
      });
      if (!res.ok) {
        useToastStore.getState().show("Failed to complete habit", "error");
        useGameStore.getState().toggleHabit(habitId);
      } else {
        await refetch();
      }
    },
    [refetch]
  );

  const getIncompleteHabits = useCallback(() => {
    const stats = useGameStore.getState().stats;
    if (!stats) return [];
    return filterSnoozedHabits(
      stats.habits.filter((h) => h.is_active && !h.completed_today),
      stats.profile
    );
  }, []);

  const completeHabitByIndex = useCallback(
    async (index: number) => {
      const habit = getIncompleteHabits()[index];
      if (!habit) return;
      await completeHabitById(habit.id, habit.name);
    },
    [getIncompleteHabits, completeHabitById]
  );

  const completeNextHabit = useCallback(async () => {
    const habit = getIncompleteHabits()[0];
    if (!habit) {
      useToastStore.getState().show("All habits done!", "success");
      return;
    }
    await completeHabitById(habit.id, habit.name);
  }, [getIncompleteHabits, completeHabitById]);

  const undoLast = useCallback(async () => {
    const { undoUntil } = useGameStore.getState();
    if (!undoUntil || Date.now() >= undoUntil) {
      useToastStore.getState().show("Nothing to undo", "info");
      return;
    }
    const res = await jarvisFetch("/api/habits/undo", { method: "POST" });
    if (!res.ok) {
      useToastStore.getState().show("Undo expired", "error");
      return;
    }
    useGameStore.getState().setUndoUntil(null);
    useToastStore.getState().show("Undone", "info");
    await refetch();
  }, [refetch]);

  useEffect(() => {
    if (!enabled) return;

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;

      if (key >= "1" && key <= "9") {
        e.preventDefault();
        void completeHabitByIndex(parseInt(key, 10) - 1);
        return;
      }

      if (key === "n" || key === "N") {
        e.preventDefault();
        void completeNextHabit();
        return;
      }

      if (key === "u" || key === "U") {
        e.preventDefault();
        void undoLast();
        return;
      }

      if (key === "f" || key === "F") {
        e.preventDefault();
        toggleFocusMode();
        return;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, completeHabitByIndex, completeNextHabit, undoLast, toggleFocusMode]);
}
