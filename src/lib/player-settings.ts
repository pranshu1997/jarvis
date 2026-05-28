import type { DashboardStats, Habit, Profile, RankTier } from "@/types/database";
import { todayISO } from "@/lib/utils";

export interface WeightLogEntry {
  date: string;
  kg: number;
}

export interface LastUndoSnapshot {
  type: "habit_complete" | "supplement" | "habit_increment";
  habitId?: string;
  supplementId?: string;
  habitSnapshot?: Habit;
  xpRemoved: number;
  eventId?: string;
  wasCompleted: boolean;
  supplementTaken?: boolean;
  comboBefore: number;
  created_at: string;
}

export interface PlayerSettings {
  streak_shields_per_week?: number;
  streak_shields_used?: number;
  week_key?: string;
  pinned_quest_id?: string | null;
  weekly_focus?: string;
  weekly_focus_week?: string;
  weight_logs?: WeightLogEntry[];
  mission_brief_shown_date?: string;
  notifications_enabled?: boolean;
  last_undo?: LastUndoSnapshot | null;
  habit_reminders?: Record<string, { hour: number; minute: number; enabled: boolean }>;
}

export function getWeekKey(date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getFullYear()}-W${week}`;
}

export function getPlayerSettings(profile: Profile): PlayerSettings {
  return (profile.settings ?? {}) as PlayerSettings;
}

export function setPlayerSettings(
  profile: Profile,
  patch: Partial<PlayerSettings>
): void {
  profile.settings = { ...getPlayerSettings(profile), ...patch };
}

export function ensureWeekShields(state: DashboardStats): number {
  const settings = getPlayerSettings(state.profile);
  const weekKey = getWeekKey();
  if (settings.week_key !== weekKey) {
    setPlayerSettings(state.profile, {
      week_key: weekKey,
      streak_shields_used: 0,
      streak_shields_per_week: settings.streak_shields_per_week ?? 1,
    });
  }
  const s = getPlayerSettings(state.profile);
  const perWeek = s.streak_shields_per_week ?? 1;
  const used = s.streak_shields_used ?? 0;
  return Math.max(0, perWeek - used);
}

export function consumeStreakShield(state: DashboardStats): boolean {
  const remaining = ensureWeekShields(state);
  if (remaining <= 0) return false;
  const s = getPlayerSettings(state.profile);
  setPlayerSettings(state.profile, {
    streak_shields_used: (s.streak_shields_used ?? 0) + 1,
  });
  return true;
}

export function getComboCount(state: DashboardStats): number {
  return (
    (state.dailyCompletion?.metadata?.combo_count as number | undefined) ?? 0
  );
}

export function setComboCount(state: DashboardStats, count: number): void {
  if (!state.dailyCompletion) return;
  state.dailyCompletion.metadata = {
    ...state.dailyCompletion.metadata,
    combo_count: count,
  };
}

export function getWeightLogs(state: DashboardStats): WeightLogEntry[] {
  return getPlayerSettings(state.profile).weight_logs ?? [];
}

export function getPinnedQuestId(state: DashboardStats): string | null {
  return getPlayerSettings(state.profile).pinned_quest_id ?? null;
}

export function shouldShowMissionBrief(state: DashboardStats): boolean {
  const hour = new Date().getHours();
  if (hour >= 11) return false;
  const shown = getPlayerSettings(state.profile).mission_brief_shown_date;
  return shown !== todayISO();
}

export function markMissionBriefShown(state: DashboardStats): void {
  setPlayerSettings(state.profile, {
    mission_brief_shown_date: todayISO(),
  });
}

export function rankOrder(rank: RankTier): number {
  const order: RankTier[] = [
    "E",
    "D",
    "C",
    "B",
    "A",
    "S",
    "NATIONAL",
    "MONARCH",
  ];
  return order.indexOf(rank);
}
