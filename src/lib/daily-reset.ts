import type { DashboardStats } from "@/types/database";
import {
  getPlayerSettings,
  getWeekKey,
  setPlayerSettings,
} from "@/lib/player-settings";
import { processStreakBreaksOnReset } from "@/lib/phoenix";
import { generateWeeklyQuestsIfNeeded } from "@/lib/weekly-quest-gen";
import { ensureDungeonQuest } from "@/lib/dungeons";
import { todayISO } from "@/lib/utils";

export function applyDailyResetIfNeeded(state: DashboardStats): boolean {
  const today = todayISO();
  const lastDate = state.dailyCompletion?.completion_date;

  if (lastDate === today) return false;

  processStreakBreaksOnReset(state);

  for (const habit of state.habits) {
    habit.completed_today = false;
    const meta = habit.metadata as {
      current_value?: number;
      skipped_today?: boolean;
      skip_reason?: string;
    };
    const rest = { ...meta };
    delete rest.skipped_today;
    delete rest.skip_reason;
    habit.metadata = rest;
    if (habit.target_value != null) {
      habit.metadata = { ...habit.metadata, current_value: 0 };
    }
  }

  for (const sup of state.supplements) {
    sup.taken_today = false;
  }

  for (const sport of state.sports ?? []) {
    sport.played_today = false;
  }

  for (const session of state.workoutSessions ?? []) {
    if (session.is_active) {
      session.is_active = false;
      session.ended_at = new Date().toISOString();
    }
  }

  if (state.dailyCompletion) {
    state.dailyCompletion.completion_date = today;
    state.dailyCompletion.completed_habits = 0;
    state.dailyCompletion.total_xp = 0;
    state.dailyCompletion.perfect_day = false;
    state.dailyCompletion.physical_complete = false;
    state.dailyCompletion.mental_complete = false;
    state.dailyCompletion.awareness_complete = false;
    state.dailyCompletion.vitality_complete = false;
    state.dailyCompletion.metadata = {
      combo_count: 0,
      perfect_days_week: (
        (state.dailyCompletion.metadata?.perfect_days_week as string[]) ?? []
      ).filter((d) => {
        const diff =
          (new Date(today).getTime() - new Date(d).getTime()) / 86400000;
        return diff >= 0 && diff < 7;
      }),
    };
  }

  const settings = getPlayerSettings(state.profile);
  if (settings.week_key !== getWeekKey()) {
    setPlayerSettings(state.profile, {
      week_key: getWeekKey(),
      streak_shields_used: 0,
      streak_shields_per_week: settings.streak_shields_per_week ?? 1,
    });
  }

  setPlayerSettings(state.profile, { last_undo: null });

  for (const quest of state.quests) {
    if (quest.quest_type === "daily" && quest.status === "completed") {
      quest.status = "active";
      quest.current_count = 0;
      quest.completed_at = null;
    }
    if (quest.quest_type === "weekly" && quest.status === "completed") {
      quest.status = "active";
      quest.current_count = 0;
      quest.completed_at = null;
    }
  }

  generateWeeklyQuestsIfNeeded(state);
  ensureDungeonQuest(state);

  return true;
}
