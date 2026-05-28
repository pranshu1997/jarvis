import type { DashboardStats } from "@/types/database";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export function deriveAchievements(stats: DashboardStats): Achievement[] {
  const habits = stats.habits.filter((h) => h.is_active);
  const maxStreak = Math.max(0, ...habits.map((h) => h.longest_streak));
  const perfectDays = (
    (stats.dailyCompletion?.metadata as { perfect_days_week?: string[] })
      ?.perfect_days_week ?? []
  ).length;

  return [
    {
      id: "first_steps",
      title: "Awakened",
      description: "Reach player level 5",
      unlocked: stats.profile.player_level >= 5,
      icon: "zap",
    },
    {
      id: "rank_c",
      title: "C-Rank Hunter",
      description: "Achieve C rank or higher",
      unlocked: ["C", "B", "A", "S", "NATIONAL", "MONARCH"].includes(
        stats.profile.rank
      ),
      icon: "shield",
    },
    {
      id: "streak_7",
      title: "Streak Ignition",
      description: "Any habit at 7+ day streak",
      unlocked: maxStreak >= 7,
      icon: "flame",
    },
    {
      id: "perfect_day",
      title: "Perfect Day",
      description: "Complete every habit in one day",
      unlocked: !!stats.dailyCompletion?.perfect_day,
      icon: "star",
    },
    {
      id: "perfect_week",
      title: "Perfect Week",
      description: "5+ perfect days this week",
      unlocked: perfectDays >= 5,
      icon: "trophy",
    },
    {
      id: "physical_master",
      title: "Physical Dominance",
      description: "Physical category level 10+",
      unlocked:
        (stats.categories.find((c) => c.slug === "physical")?.level ?? 0) >= 10,
      icon: "dumbbell",
    },
    {
      id: "pr_hunter",
      title: "PR Hunter",
      description: "Set a personal record on any exercise",
      unlocked: stats.workoutLogs?.some((l) => l.is_pr) ?? false,
      icon: "target",
    },
    {
      id: "supplement_stack",
      title: "Stack Master",
      description: "All supplements taken today",
      unlocked:
        stats.supplements.filter((s) => s.is_active).length > 0 &&
        stats.supplements
          .filter((s) => s.is_active)
          .every((s) => s.taken_today),
      icon: "sparkles",
    },
  ];
}
