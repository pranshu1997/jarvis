"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/stores/game-store";
import { getExtended } from "@/lib/player-settings-extended";
import { getPlayerSettings } from "@/lib/player-settings";
import { getAtRiskHabits } from "@/lib/mission-brief";

export function ReminderScheduler() {
  const stats = useGameStore((s) => s.stats);
  const fired = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!stats || typeof window === "undefined") return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    if (!getPlayerSettings(stats.profile).notifications_enabled) return;
    const ext = getExtended(stats.profile);

    const tick = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const key = `${hour}:${minute}`;

      const reminders = ext.habit_reminders ?? {};
      for (const [habitId, r] of Object.entries(reminders)) {
        if (!r.enabled) continue;
        if (r.hour === hour && r.minute === minute) {
          const id = `habit-${habitId}-${key}`;
          if (fired.current.has(id)) continue;
          const h = stats.habits.find((x) => x.id === habitId);
          if (h && !h.completed_today) {
            new Notification("Forge Protocol", {
              body: `Time for: ${h.name}`,
              icon: "/icons/icon-192.png",
            });
            fired.current.add(id);
          }
        }
      }

      if (hour === 22 && minute === 0) {
        const atRisk = getAtRiskHabits(stats);
        if (atRisk.length > 0 && !fired.current.has("at-risk")) {
          new Notification("Streak at risk", {
            body: `${atRisk.length} streak(s) need attention before midnight`,
            icon: "/icons/icon-192.png",
          });
          fired.current.add("at-risk");
        }
      }

      for (const q of stats.quests) {
        if (q.status !== "active" || !q.expires_at) continue;
        const hoursLeft = (new Date(q.expires_at).getTime() - Date.now()) / 3600000;
        if (hoursLeft > 0 && hoursLeft <= 24) {
          const id = `quest-exp-${q.id}`;
          if (fired.current.has(id)) continue;
          new Notification("Quest expiring", {
            body: `"${q.title}" expires in ${Math.round(hoursLeft)}h`,
            icon: "/icons/icon-192.png",
          });
          fired.current.add(id);
        }
      }
    };

    const t = setInterval(tick, 30_000);
    tick();
    return () => clearInterval(t);
  }, [stats]);

  return null;
}
