"use client";

import { useEffect, useState } from "react";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { getExtended } from "@/lib/player-settings-extended";

export function CompactModeToggle() {
  const { stats, refetch } = useDashboard();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (!stats) return;
    const on = !!getExtended(stats.profile).compact_mode;
    setCompact(on);
    document.documentElement.classList.toggle("compact-mode", on);
  }, [stats]);

  if (!stats) return null;

  const toggle = async () => {
    const next = !compact;
    setCompact(next);
    document.documentElement.classList.toggle("compact-mode", next);
    await jarvisFetch("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify({ compactMode: next }),
    });
    refetch();
  };

  const isCompact = compact || !!getExtended(stats.profile).compact_mode;

  return (
    <button type="button" onClick={toggle} className="text-[10px] text-cyan-500/50 hover:text-cyan-400 border border-cyan-500/20 rounded-full px-3 py-1">
      {isCompact ? "Expand HUD" : "Compact HUD"}
    </button>
  );
}
