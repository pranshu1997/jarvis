export type RankTier =
  | "E"
  | "D"
  | "C"
  | "B"
  | "A"
  | "S"
  | "NATIONAL"
  | "MONARCH";

export type QuestType = "daily" | "weekly" | "main" | "side" | "dungeon";
export type QuestStatus = "active" | "completed" | "failed" | "expired";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  player_level: number;
  total_xp: number;
  power_score: number;
  discipline_score: number;
  momentum_score: number;
  consistency_score: number;
  rank: RankTier;
  is_guest: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  parent_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  category_type: string;
  sort_order: number;
  base_xp: number;
  level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  rank: RankTier;
  is_system: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string | null;
  category_id: string | null;
  skill_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  base_xp: number;
  level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  target_value: number | null;
  unit: string | null;
  is_system: boolean;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  category?: Category;
  completed_today?: boolean;
}

export interface HabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  logged_at: string;
  value: number | null;
  completed: boolean;
  xp_earned: number;
  notes: string | null;
  created_at: string;
}

export interface Supplement {
  id: string;
  user_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  base_xp: number;
  level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  adherence_score: number;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  taken_today?: boolean;
}

export interface Exercise {
  id: string;
  user_id: string | null;
  category_id: string | null;
  skill_id: string | null;
  slug: string;
  name: string;
  muscle_group: string | null;
  base_xp: number;
  level: number;
  total_xp: number;
  personal_record: number | null;
  pr_unit: string;
  frequency_score: number;
  is_system: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: string;
  user_id: string | null;
  slug: string;
  title: string;
  description: string | null;
  quest_type: QuestType;
  status: QuestStatus;
  target_count: number;
  current_count: number;
  xp_reward: number;
  rank_required: RankTier | null;
  category_id: string | null;
  is_system: boolean;
  expires_at: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface XpEvent {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string | null;
  base_xp: number;
  final_xp: number;
  streak_multiplier: number;
  combo_multiplier: number;
  consistency_multiplier: number;
  momentum_multiplier: number;
  bonus_multiplier: number;
  reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DailyCompletion {
  id: string;
  user_id: string;
  completion_date: string;
  physical_complete: boolean;
  mental_complete: boolean;
  awareness_complete: boolean;
  vitality_complete: boolean;
  perfect_day: boolean;
  total_habits: number;
  completed_habits: number;
  total_xp: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DashboardStats {
  profile: Profile;
  categories: Category[];
  habits: Habit[];
  supplements: Supplement[];
  quests: Quest[];
  dailyCompletion: DailyCompletion | null;
  recentXpEvents: XpEvent[];
}
