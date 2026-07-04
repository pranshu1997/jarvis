"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/stores/game-store";
import { getExtended } from "@/lib/player-settings-extended";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";

export function TodayIntentionInput() {
  const stats = useGameStore((s) => s.stats);
  const { refetch } = useDashboard();
  const [text, setText] = useState("");

  useEffect(() => {
    if (stats) setText(getExtended(stats.profile).today_intention ?? "");
  }, [stats]);

  if (!stats) return null;

  const save = async () => {
    await jarvisFetch("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify({ todayIntention: text }),
    });
    refetch();
  };

  return (
    <div className="rounded-xl border border-cyan-500/15 p-3">
      <p className="text-[10px] uppercase tracking-widest text-cyan-500/40 mb-2">Today&apos;s intention</p>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
        placeholder="What matters most today?"
        className="w-full bg-transparent text-sm text-cyan-100 placeholder:text-cyan-500/30 outline-none"
        maxLength={120}
      />
    </div>
  );
}
