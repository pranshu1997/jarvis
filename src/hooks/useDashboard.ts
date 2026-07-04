"use client";

import { useCallback, useEffect, useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { useToastStore } from "@/stores/toast-store";
import { hapticSuccess, playSound, isSoundEnabled } from "@/lib/feedback";
import { hapticCombo } from "@/lib/haptics";
import { jarvisFetch } from "@/lib/api-client";
import { rankOrder } from "@/lib/player-settings";
import type { DashboardStats, RankTier } from "@/types/database";

const DASHBOARD_CACHE_KEY = "jarvis_dashboard_cache_v1";

interface ActionResult {
  xpEarned?: number;
  leveledUp?: boolean;
  playerLevel?: number;
  previousLevel?: number;
  previousRank?: RankTier;
  newRank?: RankTier;
  categoryComplete?: string;
  perfectDay?: boolean;
  isPerfectWeek?: boolean;
  phoenixBonus?: number;
  comboCount?: number;
}

export function useDashboard() {
  const { stats, isLoading, setStats, setLoading } = useGameStore();
  const [categoryCelebration, setCategoryCelebration] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!useGameStore.getState().stats) setLoading(true);
    try {
      const res = await jarvisFetch("/api/dashboard");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ??
            (res.status === 401 ? "Unauthorized" : "Failed to load")
        );
      }
      const data: DashboardStats = await res.json();
      try {
        sessionStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(data));
      } catch {
        /* ignore quota */
      }
      setStats(data);
      void jarvisFetch("/api/backup/run-if-due", { method: "POST" });
    } catch (e) {
      if (!(e instanceof Error && e.message === "Unauthorized")) {
        useToastStore.getState().show("Failed to sync data", "error");
      }
      setLoading(false);
    }
  }, [setStats, setLoading]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
      if (raw) {
        setStats(JSON.parse(raw) as DashboardStats);
      }
    } catch {
      /* ignore corrupt cache */
    }
    void fetchDashboard();
  }, [fetchDashboard, setStats]);

  const handleActionResult = useCallback(
    (result: ActionResult, x = 50, y = 40) => {
      const sound = isSoundEnabled();
      if (result.xpEarned && result.xpEarned > 0) {
        useGameStore.getState().addXpAnimation({
          id: `xp-${Date.now()}`,
          amount: result.xpEarned,
          x,
          y,
        });
        useGameStore.getState().setUndoUntil(Date.now() + 10_000);
        playSound("complete", sound);
        if (useGameStore.getState().platform === "mobile") hapticSuccess();
      }
      if (
        result.leveledUp &&
        result.playerLevel &&
        result.previousLevel &&
        result.playerLevel > result.previousLevel
      ) {
        useGameStore.getState().triggerLevelUp(result.playerLevel);
        playSound("levelup", sound);
        useToastStore.getState().show(
          `Level Up! Hunter Level ${result.playerLevel}`,
          "celebration"
        );
      }
      if (
        result.previousRank &&
        result.newRank &&
        rankOrder(result.newRank) > rankOrder(result.previousRank)
      ) {
        useGameStore.getState().triggerRankUp(result.newRank);
        playSound("levelup", sound);
        useToastStore.getState().show(
          `Rank Up! ${result.newRank}`,
          "celebration"
        );
      }
      if (result.categoryComplete) {
        const cat = useGameStore.getState().stats?.categories.find(
          (c) => c.slug === result.categoryComplete
        );
        setCategoryCelebration(cat?.name ?? result.categoryComplete);
        playSound("category", sound);
        setTimeout(() => setCategoryCelebration(null), 5000);
      }
      if (result.perfectDay) {
        playSound("quest", sound);
        useToastStore.getState().show("Perfect Day achieved!", "celebration");
      }
      if (result.isPerfectWeek) {
        playSound("levelup", sound);
        useGameStore.getState().triggerPerfectWeek();
        useToastStore.getState().show("Perfect Week unlocked!", "celebration");
      }
      if (result.phoenixBonus) {
        useGameStore.getState().triggerPhoenix();
        useToastStore.getState().show("Phoenix Rising — streak restored!", "celebration");
      }
      if (result.comboCount && result.comboCount >= 3 && result.comboCount % 5 === 0) {
        hapticCombo();
      }
    },
    []
  );

  const completeHabit = useCallback(
    async (habitId: string, completed = true) => {
      const prev = useGameStore.getState().stats;
      if (!prev) return;

      const habit = prev.habits.find((h) => h.id === habitId);
      if (!habit) return;

      if (completed && !habit.completed_today) {
        useGameStore.getState().toggleHabit(habitId);
      } else if (!completed && habit.completed_today) {
        useGameStore.getState().toggleHabit(habitId);
      } else return;

      try {
        const res = await jarvisFetch("/api/habits/complete", {
          method: "POST",
          body: JSON.stringify({ habitId, completed }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Unauthorized");

        await fetchDashboard();
        if (completed) handleActionResult(data);
      } catch (e) {
        useGameStore.getState().toggleHabit(habitId);
        useToastStore
          .getState()
          .show(e instanceof Error ? e.message : "Save failed", "error");
      }
    },
    [fetchDashboard, handleActionResult]
  );

  const skipHabit = useCallback(
    async (habitId: string, reason: "rest" | "sick" | "travel" | "busy" | "forgot") => {
      try {
        const res = await jarvisFetch("/api/habits/skip", {
          method: "POST",
          body: JSON.stringify({ habitId, reason }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed");
        useToastStore.getState().show(
          `Streak shield used · ${data.shieldsLeft} left`,
          "info"
        );
        await fetchDashboard();
      } catch (e) {
        useToastStore
          .getState()
          .show(e instanceof Error ? e.message : "Failed", "error");
      }
    },
    [fetchDashboard]
  );

  const incrementHabit = useCallback(
    async (habitId: string, delta: number) => {
      try {
        const res = await jarvisFetch("/api/habits/increment", {
          method: "POST",
          body: JSON.stringify({ habitId, delta }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Unauthorized");
        await fetchDashboard();
        if (data.uncompleted) {
          useToastStore.getState().show("Count updated — habit marked incomplete", "info");
        } else if (data.xpEarned > 0) {
          handleActionResult({
            xpEarned: data.xpEarned,
            leveledUp: !!data.leveledUp,
            playerLevel: data.leveledUp,
            previousLevel: (data.leveledUp ?? 1) - 1,
            previousRank: useGameStore.getState().stats?.profile.rank,
            newRank: useGameStore.getState().stats?.profile.rank,
          });
        }
      } catch (e) {
        useToastStore
          .getState()
          .show(e instanceof Error ? e.message : "Failed", "error");
      }
    },
    [fetchDashboard, handleActionResult]
  );

  const toggleSupplement = useCallback(
    async (supplementId: string, taken: boolean) => {
      const prev = useGameStore.getState().stats;
      if (!prev) return;
      useGameStore.getState().toggleSupplement(supplementId);

      try {
        const res = await jarvisFetch("/api/supplements/complete", {
          method: "POST",
          body: JSON.stringify({ supplementId, taken }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed");
        await fetchDashboard();
        handleActionResult(data);
        if (taken) {
          useGameStore.getState().setUndoUntil(Date.now() + 10_000);
          if (useGameStore.getState().platform === "mobile") hapticSuccess();
        }
      } catch (e) {
        useGameStore.getState().toggleSupplement(supplementId);
        useToastStore
          .getState()
          .show(e instanceof Error ? e.message : "Failed", "error");
      }
    },
    [fetchDashboard, handleActionResult]
  );

  const completeCategory = useCallback(
    async (categorySlug: string) => {
      const prev = useGameStore.getState().stats;
      if (!prev) return;
      const toComplete = prev.habits.filter(
        (h) =>
          h.is_active &&
          !h.completed_today &&
          (h.metadata as { category_slug?: string })?.category_slug === categorySlug
      );
      for (const h of toComplete) {
        await completeHabit(h.id, true);
      }
    },
    [completeHabit]
  );

  const dismissCategoryCelebration = useCallback(
    () => setCategoryCelebration(null),
    []
  );

  return {
    stats,
    isLoading,
    refetch: fetchDashboard,
    completeHabit,
    skipHabit,
    incrementHabit,
    toggleSupplement,
    completeCategory,
    categoryCelebration,
    dismissCategoryCelebration,
  };
}
