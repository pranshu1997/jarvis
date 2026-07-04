"use client";

import { useState } from "react";
import { jarvisFetch } from "@/lib/api-client";

const FILTERS = ["all", "habit", "quest", "workout", "achievement"] as const;

export function TimelineFilters({ onFilter }: { onFilter: (f: string) => void }) {
  const [active, setActive] = useState<string>("all");

  const select = (f: string) => {
    setActive(f);
    onFilter(f);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => select(f)}
          className={`text-xs px-3 py-1 rounded-full border capitalize ${
            active === f ? "border-cyan-400 bg-cyan-500/10 text-cyan-200" : "border-cyan-500/20 text-cyan-500/50"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

export function WeekComparePicker() {
  const [weekA, setWeekA] = useState("");
  const [weekB, setWeekB] = useState("");
  const [result, setResult] = useState<{ xpDelta: number; habitsDelta: number } | null>(null);

  const compare = async () => {
    if (!weekA || !weekB) return;
    const res = await jarvisFetch(`/api/reports/compare?weekA=${weekA}&weekB=${weekB}`);
    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="space-y-3 rounded-xl border border-cyan-500/15 p-4">
      <p className="text-xs uppercase tracking-widest text-cyan-500/50">Compare Weeks</p>
      <div className="flex gap-2">
        <input type="date" value={weekA} onChange={(e) => setWeekA(e.target.value)} className="bg-cyan-950/30 border border-cyan-500/20 rounded px-2 py-1 text-xs text-cyan-100" />
        <input type="date" value={weekB} onChange={(e) => setWeekB(e.target.value)} className="bg-cyan-950/30 border border-cyan-500/20 rounded px-2 py-1 text-xs text-cyan-100" />
        <button type="button" onClick={compare} className="text-xs text-cyan-400 px-2">Go</button>
      </div>
      {result && (
        <div className="text-xs text-cyan-300 space-y-1">
          <p>XP delta: {result.xpDelta >= 0 ? "+" : ""}{result.xpDelta}</p>
          <p>Habits delta: {result.habitsDelta >= 0 ? "+" : ""}{result.habitsDelta}</p>
        </div>
      )}
    </div>
  );
}
