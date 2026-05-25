"use client";

import { useCallback, useEffect } from "react";
import { useGameStore } from "@/stores/game-store";
import type { DashboardStats } from "@/types/database";

export function useDashboard() {
  const { stats, isLoading, setStats, setLoading } = useGameStore();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const data: DashboardStats = await res.json();
      setStats(data);
    } catch {
      setLoading(false);
    }
  }, [setStats, setLoading]);

  useEffect(() => {
    if (!stats) fetchDashboard();
  }, [stats, fetchDashboard]);

  const completeHabit = useCallback(
    async (habitId: string, completed: boolean) => {
      useGameStore.getState().toggleHabit(habitId);
      try {
        const res = await fetch("/api/habits/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habitId, completed }),
        });
        const data = await res.json();
        if (data.xpEarned > 0) {
          useGameStore.getState().addXpAnimation({
            id: `${habitId}-${Date.now()}`,
            amount: data.xpEarned,
            x: 50,
            y: 50,
          });
        }
      } catch {
        // Revert on failure in production
      }
    },
    []
  );

  return { stats, isLoading, refetch: fetchDashboard, completeHabit };
}
