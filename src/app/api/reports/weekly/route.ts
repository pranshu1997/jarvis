import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getWeekKey, getPlayerSettings } from "@/lib/player-settings";
import { getExtended } from "@/lib/player-settings-extended";

function generateWeeklyMarkdown(state: Parameters<Parameters<typeof withGameState>[0]>[0]): string {
  const today = new Date().toISOString().slice(0, 10);
  const weekKey = getWeekKey();
  const settings = getPlayerSettings(state.profile);
  const ext = getExtended(state.profile);

  const weekCutoff = new Date();
  weekCutoff.setDate(weekCutoff.getDate() - 7);
  const weekCutoffStr = weekCutoff.toISOString().slice(0, 10);

  const weekXp = state.recentXpEvents
    .filter((e) => e.created_at.slice(0, 10) >= weekCutoffStr)
    .reduce((s, e) => s + e.final_xp, 0);

  const perfectDays =
    ((state.dailyCompletion?.metadata as Record<string, unknown>)?.perfect_days_week as string[]) ?? [];

  const activeHabits = state.habits.filter((h) => h.is_active);
  const completedToday = activeHabits.filter((h) => h.completed_today).length;

  const sortedByStreak = [...activeHabits].sort((a, b) => b.current_streak - a.current_streak);
  const topHabit = sortedByStreak[0];
  const weakestHabit = [...activeHabits].sort((a, b) => a.current_streak - b.current_streak)[0];

  const sortedCategories = [...state.categories].sort((a, b) => b.total_xp - a.total_xp);
  const weakestCategory = [...state.categories].sort((a, b) => a.total_xp - b.total_xp)[0];

  const topSports = state.sports
    .filter((s) => s.slug !== "overall" && s.sessions_count > 0)
    .sort((a, b) => b.sessions_count - a.sessions_count)
    .slice(0, 3);

  const recentPRs = state.exercises
    .filter((e) => e.personal_record != null)
    .slice(0, 5);

  const healthLog = ext.health_sync_log ?? [];
  const recentHealth = healthLog
    .filter((e) => e.date >= weekCutoffStr)
    .slice(-7);

  const lines: string[] = [
    `# Forge Weekly Report — ${weekKey}`,
    `*Generated: ${today}*`,
    "",
    "---",
    "",
    "## Player Status",
    `- **Level:** ${state.profile.player_level}`,
    `- **Rank:** ${state.profile.rank}`,
    `- **Total XP:** ${state.profile.total_xp.toLocaleString()}`,
    `- **This week's XP:** +${weekXp}`,
    "",
    "---",
    "",
    "## Week Summary",
    `- **Perfect days this week:** ${perfectDays.length}/7`,
    `- **Habits completed today:** ${completedToday}/${activeHabits.length}`,
    `- **Weekly focus:** ${settings.weekly_focus ?? "*(not set)*"}`,
    "",
  ];

  if (topHabit) {
    lines.push("## Habit Highlights");
    lines.push(`- 🔥 **Top streak:** ${topHabit.name} — ${topHabit.current_streak} days`);
    if (weakestHabit && weakestHabit.id !== topHabit.id) {
      lines.push(`- ⚠️ **Needs attention:** ${weakestHabit.name} — ${weakestHabit.current_streak} days`);
    }
    lines.push("");
  }

  if (sortedCategories.length > 0) {
    lines.push("## Category Performance");
    for (const cat of sortedCategories) {
      lines.push(`- **${cat.name}:** Lv.${cat.level} | ${cat.total_xp.toLocaleString()} XP | 🔥 ${cat.current_streak} days`);
    }
    if (weakestCategory) {
      lines.push(`\n> Focus next week: **${weakestCategory.name}** (Lv.${weakestCategory.level})`);
    }
    lines.push("");
  }

  if (topSports.length > 0) {
    lines.push("## Sports Activity");
    for (const s of topSports) {
      lines.push(`- **${s.name}:** Lv.${s.level} | ${s.sessions_count} sessions | 🔥 ${s.current_streak}`);
    }
    lines.push("");
  }

  if (recentPRs.length > 0) {
    lines.push("## Personal Records");
    for (const ex of recentPRs) {
      lines.push(`- **${ex.name}:** ${ex.personal_record}${ex.pr_unit}`);
    }
    lines.push("");
  }

  if (recentHealth.length > 0) {
    lines.push("## Health Sync (Last 7 Days)");
    for (const h of recentHealth) {
      const parts: string[] = [`**${h.date}**`];
      if (h.steps != null) parts.push(`${h.steps.toLocaleString()} steps`);
      if (h.sleep_hours != null) parts.push(`${h.sleep_hours}h sleep`);
      if (h.hrv != null) parts.push(`HRV ${h.hrv}`);
      if (h.weight_kg != null) parts.push(`${h.weight_kg}kg`);
      lines.push(`- ${parts.join(" · ")}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("*Keep pushing — every day counts. 💪*");

  return lines.join("\n");
}

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const reportHolder = { markdown: "" };
    await withGameState((state) => {
      reportHolder.markdown = generateWeeklyMarkdown(state);
    });

    return new NextResponse(reportHolder.markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="jarvis-weekly-${getWeekKey()}.md"`,
      },
    });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
