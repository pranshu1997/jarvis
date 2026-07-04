import type { DashboardStats } from "@/types/database";
import { getExtended } from "@/lib/player-settings-extended";

export interface StatsSummary {
  playerLevel: number;
  rank: string;
  totalXp: number;
  streak: number;
  todayXp: number;
  completedToday: number;
  totalHabits: number;
  categoryBreakdown: { name: string; level: number; streak: number }[];
  recentPRs: { name: string; record: number; unit: string }[];
  readiness: { score: number; recommendation: string } | null;
  topSports: { name: string; level: number; sessions: number }[];
  weightTrend: { date: string; kg: number }[];
}

export function buildStatsSummary(state: DashboardStats): StatsSummary {
  const ext = getExtended(state.profile);
  const today = new Date().toISOString().slice(0, 10);
  const todayXp = state.recentXpEvents
    .filter((e) => e.created_at.startsWith(today))
    .reduce((s, e) => s + e.final_xp, 0);

  const completed = state.habits.filter((h) => h.completed_today).length;
  const totalActive = state.habits.filter((h) => h.is_active).length;

  const maxStreak = Math.max(0, ...state.habits.map((h) => h.current_streak));

  const categoryBreakdown = state.categories.map((c) => ({
    name: c.name,
    level: c.level,
    streak: c.current_streak,
  }));

  const recentPRs = state.exercises
    .filter((e) => e.personal_record != null)
    .slice(0, 5)
    .map((e) => ({ name: e.name, record: e.personal_record!, unit: e.pr_unit }));

  const readiness = state.meta?.readiness
    ? { score: state.meta.readiness.score, recommendation: state.meta.readiness.recommendation }
    : null;

  const topSports = state.sports
    .filter((s) => s.slug !== "overall" && s.sessions_count > 0)
    .sort((a, b) => b.sessions_count - a.sessions_count)
    .slice(0, 3)
    .map((s) => ({ name: s.name, level: s.level, sessions: s.sessions_count }));

  const weightTrend = (ext.readiness_log ?? [])
    .slice(-7)
    .map((r) => ({ date: r.date, kg: r.sleep }))
    .filter(() => false); // weight from weight_logs in player settings instead

  return {
    playerLevel: state.profile.player_level,
    rank: state.profile.rank,
    totalXp: state.profile.total_xp,
    streak: maxStreak,
    todayXp,
    completedToday: completed,
    totalHabits: totalActive,
    categoryBreakdown,
    recentPRs,
    readiness,
    topSports,
    weightTrend,
  };
}

export function buildStatsPromptContext(summary: StatsSummary): string {
  const lines: string[] = [
    `Player: Level ${summary.playerLevel} | Rank ${summary.rank} | ${summary.totalXp.toLocaleString()} XP`,
    `Today: ${summary.completedToday}/${summary.totalHabits} habits | ${summary.todayXp} XP earned`,
    `Best streak: ${summary.streak} days`,
    "",
    "Category levels:",
    ...summary.categoryBreakdown.map(
      (c) => `  ${c.name}: Lv.${c.level} (streak ${c.streak})`
    ),
  ];

  if (summary.topSports.length > 0) {
    lines.push("", "Sports:");
    summary.topSports.forEach((s) =>
      lines.push(`  ${s.name}: Lv.${s.level} | ${s.sessions} sessions`)
    );
  }

  if (summary.recentPRs.length > 0) {
    lines.push("", "Exercise PRs:");
    summary.recentPRs.forEach((p) =>
      lines.push(`  ${p.name}: ${p.record}${p.unit}`)
    );
  }

  if (summary.readiness) {
    lines.push(
      "",
      `Readiness score: ${summary.readiness.score}/100 → ${summary.readiness.recommendation}`
    );
  }

  return lines.join("\n");
}

interface RuleInsight {
  trigger: (summary: StatsSummary, question: string) => boolean;
  answer: (summary: StatsSummary) => string;
}

const RULE_INSIGHTS: RuleInsight[] = [
  {
    trigger: (s, q) => /streak|fire|maintain/i.test(q),
    answer: (s) =>
      s.streak > 7
        ? `Your best streak is ${s.streak} days — strong consistency! To keep it alive, focus on completing at least one habit in each category daily. Your weakest category by streak is ${s.categoryBreakdown.sort((a, b) => a.streak - b.streak)[0]?.name ?? "unknown"}.`
        : `Your best streak is ${s.streak} days. To build momentum, try completing all habits in a single category first to unlock the Category Complete 1.25× bonus.`,
  },
  {
    trigger: (s, q) => /physical|body|workout|gym|stall/i.test(q),
    answer: (s) => {
      const phys = s.categoryBreakdown.find((c) => c.name.toLowerCase().includes("physical"));
      if (!phys) return "No Physical category data found.";
      return `Physical is at Level ${phys.level} with a ${phys.streak}-day streak. ${phys.streak < 3 ? "Streaks below 3 days miss the 1.5× streak bonus — try hitting Physical habits 3 days in a row." : "Keep the streak going for the 1.75× (7-day) or 2.0× (14-day) multipliers."}`;
    },
  },
  {
    trigger: (s, q) => /mental|mindset|focus|meditat/i.test(q),
    answer: (s) => {
      const ment = s.categoryBreakdown.find((c) => c.name.toLowerCase().includes("mental"));
      if (!ment) return "No Mental category data found.";
      return `Mental is at Level ${ment.level}. ${s.completedToday < s.totalHabits ? `You have ${s.totalHabits - s.completedToday} habits left today — completing Mental habits contributes to a Perfect Day (1.5× bonus).` : "All habits done today — great discipline!"}`;
    },
  },
  {
    trigger: (s, q) => /xp|experience|point|earn/i.test(q),
    answer: (s) =>
      `You've earned ${s.todayXp} XP today. Your best XP multipliers come from streaks (up to 2.5×), combos (up to 2.0×), and Perfect Day (1.5×). ${s.completedToday === s.totalHabits ? "You hit Perfect Day today!" : `Complete ${s.totalHabits - s.completedToday} more habits for Perfect Day bonus.`}`,
  },
  {
    trigger: (s, q) => /readiness|recover|fatigue|sleep/i.test(q),
    answer: (s) =>
      s.readiness
        ? `Your readiness score is ${s.readiness.score}/100. Recommendation: ${s.readiness.recommendation}. ${s.readiness.score < 40 ? "Consider lighter training today and prioritize sleep/recovery habits." : s.readiness.score > 75 ? "You're primed for a hard session — push intensity today." : "Moderate effort recommended."}`
        : "No readiness data logged yet. Use the readiness check-in to get personalized recovery guidance.",
  },
  {
    trigger: (s, q) => /rank|promotion|level up|advance/i.test(q),
    answer: (s) =>
      `You're Rank ${s.rank} at Level ${s.playerLevel}. ${s.rank === "E" ? "Reach Level 10 for D Rank." : s.rank === "D" ? "Reach Level 20 for C Rank." : s.rank === "C" ? "Reach Level 30 for B Rank." : s.rank === "B" ? "Reach Level 45 for A Rank." : s.rank === "A" ? "Reach Level 60 for S Rank." : "You're already in the top ranks — keep pushing!"}`,
  },
  {
    trigger: () => true,
    answer: (s) =>
      `Here's your current status: Level ${s.playerLevel} ${s.rank}-Rank hunter with ${s.totalXp.toLocaleString()} total XP. Today: ${s.completedToday}/${s.totalHabits} habits (${s.todayXp} XP). Best streak: ${s.streak} days. ${s.categoryBreakdown.length > 0 ? `Categories: ${s.categoryBreakdown.map((c) => `${c.name} Lv.${c.level}`).join(", ")}.` : ""} Ask me about specific habits, streaks, workouts, or XP strategy.`,
  },
];

export function getRuleBasedAnswer(question: string, summary: StatsSummary): string {
  for (const rule of RULE_INSIGHTS) {
    if (rule.trigger(summary, question)) {
      return rule.answer(summary);
    }
  }
  return "I don't have enough data to answer that yet. Keep logging habits and check back!";
}
