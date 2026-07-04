"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type DateRange = "7d" | "30d" | "90d" | "custom";

interface DateBounds {
  from: string;
  to: string;
}

interface AnalyticsFiltersProps {
  range: DateRange;
  onRangeChange: (range: DateRange, bounds: DateBounds) => void;
}

function getRangeBounds(range: DateRange): DateBounds {
  const to = new Date().toISOString().slice(0, 10);
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const from = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  return { from, to };
}

const PRESETS: { label: string; value: DateRange }[] = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "Custom", value: "custom" },
];

export function AnalyticsFilters({ range, onRangeChange }: AnalyticsFiltersProps) {
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const handlePreset = (preset: DateRange) => {
    if (preset === "custom") return;
    onRangeChange(preset, getRangeBounds(preset));
  };

  const handleCustomApply = () => {
    if (!customFrom || !customTo) return;
    onRangeChange("custom", { from: customFrom, to: customTo });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => {
            if (p.value === "custom") {
              onRangeChange("custom", { from: customFrom, to: customTo });
            } else {
              handlePreset(p.value);
            }
          }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
            range === p.value
              ? "border-cyan-400 bg-cyan-500/15 text-cyan-200"
              : "border-slate-700 text-cyan-100/50 hover:border-cyan-500/50 hover:text-cyan-100"
          )}
        >
          {p.label}
        </button>
      ))}

      {range === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="px-2 py-1 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 text-xs"
          />
          <span className="text-cyan-500/40 text-xs">→</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="px-2 py-1 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 text-xs"
          />
          <button
            type="button"
            onClick={handleCustomApply}
            className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 text-xs hover:bg-cyan-500/30"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

export { getRangeBounds };
