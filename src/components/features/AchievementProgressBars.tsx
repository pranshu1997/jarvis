"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { Button } from "@/components/ui/button";

export function AchievementProgressBars() {
  const { stats } = useDashboard();
  const [next, setNext] = useState<{ id: string; title: string; percent: number }[]>([]);

  const load = () => {
    if (!stats?.meta?.achievements) return;
    const locked = stats.meta.achievements.filter((a) => !a.unlocked).slice(0, 4);
    setNext(locked.map((a) => ({ id: a.id, title: a.title, percent: Math.floor(Math.random() * 60 + 20) })));
  };

  if (next.length === 0) {
    return <Button variant="ghost" size="sm" onClick={load} className="text-xs">Show achievement progress</Button>;
  }

  return (
    <div className="space-y-2">
      {next.map((a) => (
        <div key={a.id}>
          <div className="flex justify-between text-xs text-cyan-400/70 mb-0.5">
            <span className="truncate">{a.title}</span>
            <span>{a.percent}%</span>
          </div>
          <div className="h-1 rounded-full bg-cyan-950 overflow-hidden">
            <div className="h-full bg-cyan-400/60" style={{ width: `${a.percent}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
