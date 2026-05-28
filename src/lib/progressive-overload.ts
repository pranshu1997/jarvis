import type { DashboardStats, Exercise } from "@/types/database";

export interface OverloadSuggestion {
  weight: number | null;
  reps: number | null;
  sets: number | null;
  note: string;
}

export function suggestNextSession(
  state: DashboardStats,
  exercise: Exercise
): OverloadSuggestion {
  const logs = (state.workoutLogs ?? [])
    .filter((l) => l.exercise_id === exercise.id)
    .sort((a, b) => b.logged_at.localeCompare(a.logged_at))
    .slice(0, 3);

  if (logs.length === 0) {
    return {
      weight: exercise.personal_record,
      reps: 8,
      sets: 3,
      note: "First session — start moderate",
    };
  }

  const last = logs[0];
  const hits = logs.filter(
    (l) => l.reps != null && l.reps >= 8 && (l.weight ?? 0) >= (last.weight ?? 0)
  ).length;
  const misses = logs.filter((l) => l.reps != null && l.reps < 6).length;

  let weight = last.weight ?? exercise.personal_record;
  let note = "Maintain weight — hit all reps";

  if (hits >= 2 && weight != null) {
    weight = Math.round((weight + 2.5) * 10) / 10;
    note = "Progressive overload: +2.5kg";
  } else if (misses >= 2 && weight != null) {
    weight = Math.max(0, Math.round((weight - 2.5) * 10) / 10);
    note = "Deload: −2.5kg";
  }

  return {
    weight,
    reps: last.reps ?? 8,
    sets: last.sets ?? 3,
    note,
  };
}
