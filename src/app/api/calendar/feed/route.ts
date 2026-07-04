import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getWeekKey, getPlayerSettings } from "@/lib/player-settings";

function escapeIcs(value: string): string {
  return value.replace(/[\\;,\n\r]/g, (c) => {
    if (c === "\n" || c === "\r") return "\\n";
    return `\\${c}`;
  });
}

function toIcsDate(iso: string): string {
  return iso.replace(/[-:]/g, "").slice(0, 15) + "Z";
}

function foldLine(line: string): string {
  const maxLen = 75;
  if (line.length <= maxLen) return line;
  const parts: string[] = [];
  let remaining = line;
  while (remaining.length > maxLen) {
    parts.push(remaining.slice(0, maxLen));
    remaining = " " + remaining.slice(maxLen);
  }
  parts.push(remaining);
  return parts.join("\r\n");
}

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    let icsContent = "";

    await withGameState((state) => {
      const settings = getPlayerSettings(state.profile);
      const weekKey = getWeekKey();

      const now = new Date().toISOString();
      const uid = `jarvis-weekly-review-${weekKey}@jarvis.local`;

      // Weekly review event: Sunday at 18:00 for 1 hour
      const sunday = new Date();
      sunday.setDate(sunday.getDate() + (7 - sunday.getDay()) % 7);
      sunday.setHours(18, 0, 0, 0);
      const sundayEnd = new Date(sunday.getTime() + 60 * 60 * 1000);

      const level = state.profile.player_level;
      const rank = state.profile.rank;
      const weekXp = state.recentXpEvents
        .filter((e) => {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 7);
          return e.created_at >= cutoff.toISOString();
        })
        .reduce((s, e) => s + e.final_xp, 0);

      const summary = `Lv.${level} ${rank} · +${weekXp} XP this week`;
      const description = [
        `Weekly Review — ${weekKey}`,
        `Focus: ${settings.weekly_focus ?? "not set"}`,
        `Player: Level ${level} ${rank}`,
        `XP earned this week: +${weekXp}`,
        "",
        "Review your category progress, set next week's focus, and plan quests.",
      ].join("\\n");

      const events: string[] = [];

      events.push([
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${toIcsDate(now)}`,
        `DTSTART:${toIcsDate(sunday.toISOString())}`,
        `DTEND:${toIcsDate(sundayEnd.toISOString())}`,
        `SUMMARY:${escapeIcs(`JARVIS Weekly Review — ${weekKey} (${summary})`)}`,
        `DESCRIPTION:${description}`,
        "CATEGORIES:JARVIS,HEALTH,REVIEW",
        "END:VEVENT",
      ].map(foldLine).join("\r\n"));

      // Add habit reminder events for active habits with reminders
      const habitReminders = settings.habit_reminders ?? {};
      for (const habit of state.habits.filter((h) => h.is_active)) {
        const reminder = habitReminders[habit.id];
        if (!reminder?.enabled) continue;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(reminder.hour, reminder.minute, 0, 0);
        const tomorrowEnd = new Date(tomorrow.getTime() + 15 * 60 * 1000);

        events.push([
          "BEGIN:VEVENT",
          `UID:jarvis-habit-${habit.id}-${tomorrow.toISOString().slice(0, 10)}@jarvis.local`,
          `DTSTAMP:${toIcsDate(now)}`,
          `DTSTART:${toIcsDate(tomorrow.toISOString())}`,
          `DTEND:${toIcsDate(tomorrowEnd.toISOString())}`,
          `SUMMARY:${escapeIcs(`JARVIS: ${habit.name}`)}`,
          `DESCRIPTION:${escapeIcs(`Complete habit: ${habit.name}\\nStreak: ${habit.current_streak} days`)}`,
          "CATEGORIES:JARVIS,HABIT",
          "RRULE:FREQ=DAILY",
          "END:VEVENT",
        ].map(foldLine).join("\r\n"));
      }

      icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//JARVIS//Habit Tracker//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        `X-WR-CALNAME:JARVIS Evolution`,
        `X-WR-CALDESC:Habit reminders and weekly reviews from JARVIS`,
        ...events,
        "END:VCALENDAR",
      ].join("\r\n");
    });

    return new NextResponse(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"jarvis.ics\"",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
