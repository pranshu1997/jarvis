"use client";

import type { Quest } from "@/types/database";

export function QuestCountdown({ quest }: { quest: Quest }) {
  if (!quest.expires_at || quest.status !== "active") return null;
  const exp = new Date(quest.expires_at).getTime();
  const hours = Math.max(0, Math.round((exp - Date.now()) / 3600000));
  if (hours > 72) return null;

  return (
    <span className={`text-[10px] font-mono ${hours <= 24 ? "text-orange-400" : "text-cyan-500/50"}`}>
      {hours}h left
    </span>
  );
}
