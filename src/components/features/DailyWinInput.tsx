"use client";

import { useState } from "react";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { useGameStore } from "@/stores/game-store";
import { Trophy } from "lucide-react";

export function DailyWinInput() {
  const { refetch } = useDashboard();
  const existing = useGameStore((s) => (s.stats?.meta as { dailyWin?: string })?.dailyWin);
  const [win, setWin] = useState(existing ?? "");
  const [saved, setSaved] = useState(!!existing);

  const save = async () => {
    if (!win.trim()) return;
    await jarvisFetch("/api/daily-win", { method: "POST", body: JSON.stringify({ win: win.trim() }) });
    setSaved(true);
    refetch();
  };

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-amber-400/60 flex items-center gap-1">
        <Trophy className="w-3 h-3" /> Today&apos;s win
      </p>
      {saved && !win ? (
        <p className="text-xs text-amber-200/70 italic">{existing}</p>
      ) : (
        <div className="flex gap-2">
          <input
            value={win}
            onChange={(e) => { setWin(e.target.value); setSaved(false); }}
            placeholder="One thing that went well…"
            className="flex-1 text-xs bg-slate-900/60 border border-amber-500/20 rounded px-2 py-1.5 text-cyan-100"
          />
          <button type="button" onClick={() => void save()} className="text-[10px] px-2.5 py-1 rounded border border-amber-400/40 text-amber-300">
            Save
          </button>
        </div>
      )}
    </div>
  );
}
