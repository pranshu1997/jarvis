import { ACHIEVEMENT_CATALOG } from "@/lib/achievements-db";
import { getExtended } from "@/lib/player-settings-extended";
import type { DashboardStats } from "@/types/database";

export interface AchievementHint {
  id: string;
  title: string;
  hint: string;
  percent: number;
}

export function getNearUnlockAchievements(state: DashboardStats, limit = 3): AchievementHint[] {
  const unlocked = getExtended(state.profile).achievements_unlocked ?? {};
  const hints: AchievementHint[] = [];

  for (const def of ACHIEVEMENT_CATALOG) {
    if (unlocked[def.id]) continue;

    let percent = 0;
    let hint = def.description;

    if (def.id.startsWith("streak_")) {
      const target = parseInt(def.id.replace("streak_", ""), 10);
      const max = Math.max(0, ...state.habits.map((h) => h.current_streak));
      percent = Math.min(99, Math.round((max / target) * 100));
      hint = `${max}/${target} day streak`;
    } else if (def.id.startsWith("hunter_")) {
      const target = parseInt(def.id.replace("hunter_", ""), 10);
      percent = Math.min(99, Math.round((state.profile.player_level / target) * 100));
      hint = `Level ${state.profile.player_level}/${target}`;
    } else if (def.id === "combo_5" || def.id === "combo_10") {
      const target = def.id === "combo_5" ? 5 : 10;
      const combo = (state.dailyCompletion?.metadata?.combo_count as number) ?? 0;
      percent = Math.min(99, Math.round((combo / target) * 100));
      hint = `Combo ${combo}/${target} today`;
    } else if (def.id === "coins_500") {
      const coins = getExtended(state.profile).shadow_coins ?? 0;
      percent = Math.min(99, Math.round((coins / 500) * 100));
      hint = `${coins}/500 coins`;
    } else if (def.id === "perfect_week") {
      const days = ((state.dailyCompletion?.metadata?.perfect_days_week as string[]) ?? []).length;
      percent = Math.min(99, Math.round((days / 5) * 100));
      hint = `${days}/5 perfect days this week`;
    } else {
      continue;
    }

    if (percent >= 40 && percent < 100) {
      hints.push({ id: def.id, title: def.title, hint, percent });
    }
  }

  return hints.sort((a, b) => b.percent - a.percent).slice(0, limit);
}
