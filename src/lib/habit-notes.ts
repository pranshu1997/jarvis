import { getExtended, patchExtended } from "@/lib/player-settings-extended";
import { todayISO } from "@/lib/utils";
import type { DashboardStats } from "@/types/database";

export function addHabitCompletionNote(
  state: DashboardStats,
  habitId: string,
  note: string
): void {
  const trimmed = note.trim();
  if (!trimmed) return;
  const ext = getExtended(state.profile);
  const all = { ...(ext.habit_completion_notes ?? {}) };
  const existing = all[habitId] ?? [];
  all[habitId] = [...existing, { date: todayISO(), note: trimmed }].slice(-20);
  patchExtended(state.profile, { habit_completion_notes: all });
}

export function getTodayNotesForHabit(state: DashboardStats, habitId: string): string[] {
  const today = todayISO();
  const notes = getExtended(state.profile).habit_completion_notes?.[habitId] ?? [];
  return notes.filter((n) => n.date === today).map((n) => n.note);
}

export function getRecentNotes(
  state: DashboardStats,
  limit = 5
): { habitId: string; habitName: string; note: string; date: string }[] {
  const all = getExtended(state.profile).habit_completion_notes ?? {};
  const entries: { habitId: string; habitName: string; note: string; date: string }[] = [];
  for (const [habitId, notes] of Object.entries(all)) {
    const habit = state.habits.find((h) => h.id === habitId);
    for (const n of notes) {
      entries.push({
        habitId,
        habitName: habit?.name ?? "Habit",
        note: n.note,
        date: n.date,
      });
    }
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}
