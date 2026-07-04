import type { DashboardStats, Profile } from "@/types/database";
import { setPlayerSettings } from "@/lib/player-settings";

export interface HealthSyncEntry {
  date: string;
  steps?: number;
  sleep_hours?: number;
  hrv?: number;
  weight_kg?: number;
  synced_at: string;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  base64: string;
  mime_type: string;
  label?: string;
  uploaded_at: string;
}

export interface XpFormulaConfig {
  base_xp_scale: number;
  streak_weight: number;
  combo_weight: number;
  consistency_weight: number;
  momentum_weight: number;
  perfect_day_bonus: number;
  category_complete_bonus: number;
}

export interface CustomCategoryMeta {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string | null;
  created_at: string;
}

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
  phase?: number;
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

export interface CoachChatMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export interface HabitDependency {
  habit_id: string;
  requires_habit_id: string;
  min_streak: number;
}

export interface GuildWarEntry {
  week: string;
  winner_slug: string;
  xp_by_category: Record<string, number>;
  bonus_coins: number;
}

export interface SkillTreeUpgrade {
  skill_id: string;
  purchased_at: string;
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
  workout_templates?: { id: string; name: string; exercise_ids: string[]; notes?: string }[];
  cosmetics_owned?: string[];
  main_quest_chapter?: number;
  seasonal_events_seen?: string[];
  pinned_habit_ids?: string[];
  health_sync_log?: HealthSyncEntry[];
  progress_photos?: ProgressPhoto[];
  xp_formula_config?: Partial<XpFormulaConfig>;
  custom_categories_meta?: CustomCategoryMeta[];
  onboarding_completed?: boolean;
  morning_mode?: boolean;
  collapsed_sections?: Record<string, boolean>;
  hud_theme?: string;
  reduced_motion?: boolean;
  last_synced_at?: string;
  coach_chat_history?: CoachChatMessage[];
  webhook_url?: string;
  backup_schedule?: { enabled: boolean; hour: number; path?: string };
  skill_tree_upgrades?: SkillTreeUpgrade[];
  boss_rush_wins?: number;
  boss_rush_active?: { phase: number; started_at: string } | null;
  guild_war_history?: GuildWarEntry[];
  sound_theme?: "default" | "arcade" | "minimal" | "solo";
  theme_mode?: "dark" | "light";
  profile_avatar?: string;
  profile_title?: string;
  habit_dependencies?: HabitDependency[];
  rank_perks_claimed?: string[];
  proactive_dismissed?: string;
  pinned_quest_ids?: string[];
  today_intention?: string;
  habit_snooze?: Record<string, string>;
  compact_mode?: boolean;
  last_backup_run?: string;
  evolution_goal?: { target_rank: string; target_date: string; created_at: string };
  app_open_log?: string[];
  app_open_streak?: number;
  weekly_focus_category?: string;
  habit_completion_notes?: Record<string, { date: string; note: string }[]>;
  water_log?: Record<string, number>;
  daily_wins?: Record<string, string>;
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
  if (typeof window !== "undefined" && amount > 0) {
    window.dispatchEvent(
      new CustomEvent("jarvis-coin-earned", { detail: { amount, reason } })
    );
  }
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
