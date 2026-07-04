"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { Button } from "@/components/ui/button";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { Flame } from "lucide-react";

export function BossRushPanel() {
  const { refetch } = useDashboard();
  const meta = useGameStore((s) => s.stats?.meta as {
    bossRush?: { active: { phase: number } | null; totalWins: number; maxPhases: number };
  } | undefined);
  const rush = meta?.bossRush;
  const [msg, setMsg] = useState("");

  const start = async () => {
    const res = await jarvisFetch("/api/boss-rush", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Failed");
      return;
    }
    setMsg("Boss Rush started!");
    refetch();
  };

  if (!rush) return null;

  return (
    <div className="rounded-xl border border-red-500/25 bg-red-950/20 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Flame className="w-4 h-4 text-red-400" />
        <p className="text-sm font-semibold text-red-200">Boss Rush</p>
      </div>
      {rush.active ? (
        <p className="text-xs text-red-300/70">Phase {rush.active.phase}/{rush.maxPhases} — defeat dungeons back-to-back</p>
      ) : (
        <>
          <p className="text-xs text-red-400/60 mb-2">{rush.totalWins} rushes completed</p>
          <Button size="sm" variant="outline" onClick={start} className="border-red-500/30 text-red-300">
            Start Boss Rush
          </Button>
        </>
      )}
      {msg && <p className="text-[10px] text-red-400/60 mt-2">{msg}</p>}
    </div>
  );
}
