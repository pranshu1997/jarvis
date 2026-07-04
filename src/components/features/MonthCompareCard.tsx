"use client";

import { useState } from "react";
import { jarvisFetch } from "@/lib/api-client";

export function MonthCompareCard() {
  const [data, setData] = useState<{ xpDelta: number; daysDelta: number } | null>(null);

  const load = async () => {
    const res = await jarvisFetch("/api/analytics/month-compare");
    const d = await res.json();
    setData(d);
  };

  if (!data) {
    return (
      <button type="button" onClick={() => void load()} className="text-xs text-cyan-400 hover:text-cyan-300">
        Compare vs last month
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-cyan-500/15 p-3 text-xs text-cyan-300 space-y-1">
      <p>XP: {data.xpDelta >= 0 ? "+" : ""}{data.xpDelta} vs last month</p>
      <p>Active days: {data.daysDelta >= 0 ? "+" : ""}{data.daysDelta}</p>
    </div>
  );
}
