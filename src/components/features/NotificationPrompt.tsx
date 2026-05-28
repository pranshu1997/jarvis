"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jarvisFetch } from "@/lib/api-client";
import { useGameStore } from "@/stores/game-store";

export function NotificationPrompt() {
  const stats = useGameStore((s) => s.stats);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission !== "denied"
    );
  }, []);

  useEffect(() => {
    if (!stats || !supported) return;
    const enabled = stats.profile.settings?.notifications_enabled;
    if (!enabled || Notification.permission !== "granted") return;

    const hour = new Date().getHours();
    if (hour !== 18) return;

    const incomplete = stats.habits.filter(
      (h) => h.is_active && !h.completed_today
    ).length;
    if (incomplete > 0) {
      new Notification("Jarvis Protocol", {
        body: `${incomplete} habits left today. Protect your streaks.`,
        icon: "/icons/icon-192.png",
      });
    }
  }, [stats, supported]);

  const enable = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      await jarvisFetch("/api/profile/settings", {
        method: "PATCH",
        body: JSON.stringify({ notificationsEnabled: true }),
      });
    }
  };

  if (!supported || Notification.permission === "granted") return null;

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void enable()}>
      <Bell className="w-4 h-4" />
      Enable reminders
    </Button>
  );
}
