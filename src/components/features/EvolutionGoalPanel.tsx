"use client";

import { useEffect, useState } from "react";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

const RANKS = ["D", "C", "B", "A", "S", "MONARCH"];

export function EvolutionGoalPanel() {
  const { refetch } = useDashboard();
  const [progress, setProgress] = useState<{ targetRank: string; daysLeft: number; percent: number; onTrack: boolean } | null>(null);
  const [targetRank, setTargetRank] = useState("A");
  const [targetDate, setTargetDate] = useState("");
  const [editing, setEditing] = useState(false);

  const load = async () => {
    const res = await jarvisFetch("/api/evolution-goal");
    const d = await res.json();
    setProgress(d.progress ?? null);
    if (!d.goal) setEditing(true);
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!targetDate) return;
    await jarvisFetch("/api/evolution-goal", {
      method: "POST",
      body: JSON.stringify({ targetRank, targetDate }),
    });
    setEditing(false);
    await load();
    refetch();
  };

  if (editing) {
    return (
      <div className="rounded-xl border border-cyan-500/20 p-4 space-y-3">
        <p className="text-xs uppercase tracking-widest text-cyan-500/50 flex items-center gap-1"><Target className="w-3 h-3" /> Evolution Goal</p>
        <select value={targetRank} onChange={(e) => setTargetRank(e.target.value)} className="w-full bg-cyan-950/30 border border-cyan-500/20 rounded px-2 py-1 text-sm text-cyan-100">
          {RANKS.map((r) => <option key={r} value={r}>{r}-Rank</option>)}
        </select>
        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full bg-cyan-950/30 border border-cyan-500/20 rounded px-2 py-1 text-sm text-cyan-100" />
        <Button size="sm" onClick={save}>Set goal</Button>
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="rounded-xl border border-cyan-500/20 p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs uppercase tracking-widest text-cyan-500/50">Evolution Goal</p>
          <p className="text-lg font-bold text-cyan-100">{progress.targetRank}-Rank</p>
          <p className="text-xs text-cyan-500/50">{progress.daysLeft} days left · {progress.percent}% there</p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${progress.onTrack ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
          {progress.onTrack ? "On track" : "Push harder"}
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-cyan-950 overflow-hidden">
        <div className="h-full bg-cyan-400 transition-all" style={{ width: `${progress.percent}%` }} />
      </div>
      <button type="button" onClick={() => setEditing(true)} className="text-[10px] text-cyan-500/40 mt-2">Edit goal</button>
    </div>
  );
}
