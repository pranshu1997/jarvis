"use client";

import { useState } from "react";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { getExtended } from "@/lib/player-settings-extended";
import { Sun } from "lucide-react";

export function MorningModeToggle() {
  const { stats, refetch } = useDashboard();
  const [on, setOn] = useState(() => getExtended(stats?.profile ?? { settings: {} } as import("@/types/database").Profile).morning_mode !== false);

  if (!stats) return null;

  const toggle = async () => {
    const next = !on;
    setOn(next);
    await jarvisFetch("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify({ morningMode: next }),
    });
    refetch();
  };

  return (
    <label className="flex items-center gap-2 text-sm text-cyan-200 cursor-pointer">
      <input type="checkbox" checked={on} onChange={() => void toggle()} />
      <Sun className="w-4 h-4 text-amber-400" />
      Morning entry gate (AM protocol screen)
    </label>
  );
}
