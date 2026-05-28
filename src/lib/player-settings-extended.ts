import type { DashboardStats, Profile } from "@/types/database";
import { setPlayerSettings } from "@/lib/player-settings";

export interface ActivityDayEntry {
  physical: number;
  mental: number;
  awareness: number;
  vitality: number;
  habit_ids: string[];
  total_xp: number;
}

export interface AchievementUnlock {
  unlocked_at: string;
}

export interface PhoenixWindow {
  until: string;
  previous_streak: number;
}

export interface ReadinessEntry {
  date: string;
  sleep: number;
  energy: number;
  soreness: number;
  score: number;
  recommendation: "push" | "maintain" | "recover";
}

export interface ShopItem {
  id: string;
  title: string;
  cost: number;
  stock?: number | null;
}

export interface Routine {
  id: string;
  name: string;
  habit_ids: string[];
  bonus_xp: number;
}

export interface DungeonState {
  quest_id: string;
  boss_hp: number;
  boss_hp_max: number;
  ends_at: string;
  title: string;
}

export interface BodyMeasurement {
  date: string;
  waist?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  body_fat_pct?: number;
}

export interface MacroTargets {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface MacroLogDay {
  date: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface HabitReminder {
  hour: number;
  minute: number;
  enabled: boolean;
}

export interface ExtendedSettings {
  activity_calendar?: Record<string, ActivityDayEntry>;
  achievements_unlocked?: Record<string, AchievementUnlock>;
  shadow_coins?: number;
  shop_items?: ShopItem[];
  routines?: Routine[];
  active_dungeon?: DungeonState | null;
  body_measurements?: BodyMeasurement[];
  readiness_log?: ReadinessEntry[];
  macro_targets?: MacroTargets;
  macro_logs?: MacroLogDay[];
  habit_sort_order?: string[];
  habit_reminders?: Record<string, HabitReminder>;
  resilience_score?: number;
  coin_log?: { at: string; delta: number; reason: string }[];
  weekly_quest_gen_week?: string;
}

export function getExtended(profile: Profile): ExtendedSettings {
  return (profile.settings ?? {}) as ExtendedSettings;
}

export function patchExtended(
  profile: Profile,
  patch: Partial<ExtendedSettings>
): void {
  setPlayerSettings(profile, { ...getExtended(profile), ...patch });
}

export function getActivityCalendar(state: DashboardStats) {
  return getExtended(state.profile).activity_calendar ?? {};
}

export function getShadowCoins(state: DashboardStats): number {
  return getExtended(state.profile).shadow_coins ?? 0;
}

export function addShadowCoins(
  state: DashboardStats,
  amount: number,
  reason: string
): void {
  const ext = getExtended(state.profile);
  const coins = (ext.shadow_coins ?? 0) + amount;
  const log = [...(ext.coin_log ?? []), { at: new Date().toISOString(), delta: amount, reason }].slice(-50);
  patchExtended(state.profile, { shadow_coins: coins, coin_log: log });
}

export function getHabitSortOrder(state: DashboardStats): string[] {
  return getExtended(state.profile).habit_sort_order ?? [];
}

export function sortHabitsByUserOrder<T extends { id: string; is_active: boolean }>(
  habits: T[],
  order: string[]
): T[] {
  const active = habits.filter((h) => h.is_active);
  const archived = habits.filter((h) => !h.is_active);
  const map = new Map(active.map((h) => [h.id, h]));
  const sorted: T[] = [];
  for (const id of order) {
    const h = map.get(id);
    if (h) {
      sorted.push(h);
      map.delete(id);
    }
  }
  sorted.push(...map.values());
  return [...sorted, ...archived];
}
