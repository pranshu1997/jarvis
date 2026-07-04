import { create } from "zustand";
import type { DashboardStats } from "@/types/database";

interface XpAnimation {
  id: string;
  amount: number;
  x: number;
  y: number;
}

interface GameState {
  stats: DashboardStats | null;
  isLoading: boolean;
  platform: "desktop" | "mobile";
  xpAnimations: XpAnimation[];
  lastLevelUp: number | null;
  lastRankUp: string | null;
  lastPr: { exerciseName: string; weight: number | null } | null;
  lastPhoenix: boolean;
  lastPerfectWeek: boolean;
  undoUntil: number | null;
  undoLabel: string | null;
  setStats: (stats: DashboardStats | null) => void;
  setLoading: (loading: boolean) => void;
  setPlatform: (platform: "desktop" | "mobile") => void;
  addXpAnimation: (animation: XpAnimation) => void;
  removeXpAnimation: (id: string) => void;
  triggerLevelUp: (level: number) => void;
  clearLevelUp: () => void;
  triggerRankUp: (rank: string) => void;
  clearRankUp: () => void;
  triggerPr: (exerciseName: string, weight: number | null) => void;
  clearPr: () => void;
  triggerPhoenix: () => void;
  clearPhoenix: () => void;
  triggerPerfectWeek: () => void;
  clearPerfectWeek: () => void;
  setUndoUntil: (until: number | null, label?: string | null) => void;
  toggleHabit: (habitId: string) => void;
  toggleSupplement: (supplementId: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  stats: null,
  isLoading: true,
  platform: "desktop",
  xpAnimations: [],
  lastLevelUp: null,
  lastRankUp: null,
  lastPr: null,
  lastPhoenix: false,
  lastPerfectWeek: false,
  undoUntil: null,
  undoLabel: null,

  setStats: (stats) => set({ stats, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setPlatform: (platform) => set({ platform }),
  addXpAnimation: (animation) =>
    set((s) => ({ xpAnimations: [...s.xpAnimations, animation] })),
  removeXpAnimation: (id) =>
    set((s) => ({
      xpAnimations: s.xpAnimations.filter((a) => a.id !== id),
    })),
  triggerLevelUp: (level) => set({ lastLevelUp: level }),
  clearLevelUp: () => set({ lastLevelUp: null }),
  triggerRankUp: (rank: string) => set({ lastRankUp: rank }),
  clearRankUp: () => set({ lastRankUp: null }),
  triggerPr: (exerciseName, weight) => set({ lastPr: { exerciseName, weight } }),
  clearPr: () => set({ lastPr: null }),
  triggerPhoenix: () => set({ lastPhoenix: true }),
  clearPhoenix: () => set({ lastPhoenix: false }),
  triggerPerfectWeek: () => set({ lastPerfectWeek: true }),
  clearPerfectWeek: () => set({ lastPerfectWeek: false }),
  setUndoUntil: (undoUntil, label = null) => set({ undoUntil, undoLabel: label }),

  toggleHabit: (habitId) => {
    const { stats } = get();
    if (!stats) return;
    const habits = stats.habits.map((h) =>
      h.id === habitId
        ? { ...h, completed_today: !h.completed_today }
        : h
    );
    const completed = habits.filter((h) => h.completed_today).length;
    set({
      stats: {
        ...stats,
        habits,
        dailyCompletion: stats.dailyCompletion
          ? {
              ...stats.dailyCompletion,
              completed_habits: completed,
            }
          : null,
      },
    });
  },

  toggleSupplement: (supplementId) => {
    const { stats } = get();
    if (!stats) return;
    const supplements = stats.supplements.map((s) =>
      s.id === supplementId ? { ...s, taken_today: !s.taken_today } : s
    );
    set({ stats: { ...stats, supplements } });
  },
}));
