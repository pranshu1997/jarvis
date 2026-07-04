"use client";

import { useState } from "react";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { getExtended } from "@/lib/player-settings-extended";
import { Bell } from "lucide-react";

export function HabitReminderSettings() {
  const { stats, refetch } = useDashboard();
  const [saving, setSaving] = useState<string | null>(null);
  if (!stats) return null;

  const reminders = getExtended(stats.profile).habit_reminders ?? {};
  const habits = stats.habits.filter((h) => h.is_active).slice(0, 6);

  const setReminder = async (habitId: string, hour: number, minute: number) => {
    setSaving(habitId);
    const next = { ...reminders, [habitId]: { hour, minute, enabled: true } };
    await jarvisFetch("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify({ habitReminders: next }),
    });
    setSaving(null);
    refetch();
  };

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-widest text-cyan-500/50 flex items-center gap-1">
        <Bell className="w-3.5 h-3.5" /> Habit reminders
      </p>
      {habits.map((h) => {
        const r = reminders[h.id];
        return (
          <div key={h.id} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-cyan-200/70 truncate">{h.name}</span>
            <input
              type="time"
              defaultValue={r ? `${String(r.hour).padStart(2, "0")}:${String(r.minute).padStart(2, "0")}` : "09:00"}
              disabled={saving === h.id}
              onChange={(e) => {
                const [hh, mm] = e.target.value.split(":").map(Number);
                void setReminder(h.id, hh ?? 9, mm ?? 0);
              }}
              className="bg-slate-900 border border-cyan-500/20 rounded px-2 py-1 text-cyan-100 text-[10px]"
            />
          </div>
        );
      })}
    </div>
  );
}
