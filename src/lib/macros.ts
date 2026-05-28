import type { DashboardStats } from "@/types/database";
import {
  getExtended,
  patchExtended,
  type MacroLogDay,
  type MacroTargets,
} from "@/lib/player-settings-extended";
import { todayISO } from "@/lib/utils";

export const DEFAULT_MACRO_TARGETS: MacroTargets = {
  protein: 150,
  carbs: 200,
  fat: 65,
  calories: 2200,
};

export function getMacroTargets(state: DashboardStats): MacroTargets {
  return getExtended(state.profile).macro_targets ?? DEFAULT_MACRO_TARGETS;
}

export function getTodayMacros(state: DashboardStats): MacroLogDay {
  const today = todayISO();
  const log = getExtended(state.profile).macro_logs ?? [];
  return (
    log.find((l) => l.date === today) ?? {
      date: today,
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
    }
  );
}

export function logMeal(
  state: DashboardStats,
  meal: { protein: number; carbs: number; fat: number; calories: number }
): MacroLogDay {
  const today = todayISO();
  const logs = [...(getExtended(state.profile).macro_logs ?? [])];
  const idx = logs.findIndex((l) => l.date === today);
  const current =
    idx >= 0
      ? logs[idx]
      : { date: today, protein: 0, carbs: 0, fat: 0, calories: 0 };

  const next: MacroLogDay = {
    date: today,
    protein: current.protein + meal.protein,
    carbs: current.carbs + meal.carbs,
    fat: current.fat + meal.fat,
    calories: current.calories + meal.calories,
  };

  if (idx >= 0) logs[idx] = next;
  else logs.push(next);

  patchExtended(state.profile, { macro_logs: logs.slice(-60) });

  const targets = getMacroTargets(state);
  if (next.protein >= targets.protein) {
    const diet = state.habits.find((h) => h.slug === "follow_diet");
    if (diet && !diet.completed_today) {
      diet.completed_today = true;
    }
  }

  return next;
}
