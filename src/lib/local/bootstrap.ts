import type { DashboardStats } from "@/types/database";
import { ensureWorkoutSystem } from "@/lib/seed-workout-system";
import { rollupSkillTree } from "@/lib/workout-progression";

export function bootstrapGameState(state: DashboardStats, userId: string): boolean {
  const changed = ensureWorkoutSystem({
    skills: state.skills,
    sports: state.sports,
    exercises: state.exercises,
    workoutSessions: state.workoutSessions,
    workoutLogs: state.workoutLogs,
    userId,
  });

  state.skills = state.skills ?? [];
  state.sports = state.sports ?? [];
  state.exercises = state.exercises ?? [];
  state.workoutSessions = state.workoutSessions ?? [];
  state.workoutLogs = state.workoutLogs ?? [];

  rollupSkillTree(state.skills);
  return changed;
}
