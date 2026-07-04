"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores/game-store";
import { getExpiringQuests } from "@/lib/quest-expiry";

export function QuestExpiryNotifier() {
  const stats = useGameStore((s) => s.stats);

  useEffect(() => {
    if (!stats || typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    const expiring = getExpiringQuests(stats, 24);
    const today = new Date().toISOString().slice(0, 10);
    for (const e of expiring) {
      const key = `quest_notify_${e.quest.id}_${today}`;
      if (localStorage.getItem(key)) continue;
      localStorage.setItem(key, "1");
      new Notification("Quest expiring soon", {
        body: `${e.quest.title} — ${e.hoursLeft}h remaining`,
        icon: "/icons/icon-192.png",
      });
    }
  }, [stats]);

  return null;
}
