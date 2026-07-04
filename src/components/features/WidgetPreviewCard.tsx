"use client";

import { useEffect, useState } from "react";
import { jarvisFetch } from "@/lib/api-client";
import { Smartphone } from "lucide-react";

interface WidgetData {
  completionPercent: number;
  playerLevel: number;
  rank: string;
  priorityHabit: { name: string } | null;
  topStreak: number;
}

export function WidgetPreviewCard() {
  const [data, setData] = useState<WidgetData | null>(null);

  useEffect(() => {
    void jarvisFetch("/api/widgets/snapshot").then(async (r) => {
      if (r.ok) setData(await r.json());
    });
  }, []);

  if (!data) return null;

  return (
    <div className="rounded-xl border border-cyan-500/20 p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-cyan-500/50 flex items-center gap-1">
        <Smartphone className="w-3 h-3" /> Widget preview
      </p>
      <div className="rounded-lg bg-slate-900/80 p-3 font-mono text-xs space-y-1">
        <p className="text-cyan-300">{data.completionPercent}% today · Lv.{data.playerLevel} {data.rank}</p>
        {data.priorityHabit && <p className="text-cyan-500/60">Next: {data.priorityHabit.name}</p>}
        <p className="text-orange-400/70">Best streak: {data.topStreak}d</p>
      </div>
    </div>
  );
}
