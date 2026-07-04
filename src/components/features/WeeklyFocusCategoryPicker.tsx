"use client";

import { useState } from "react";
import { jarvisFetch } from "@/lib/api-client";
import { useDashboard } from "@/hooks/useDashboard";
import { useGameStore } from "@/stores/game-store";

export function WeeklyFocusCategoryPicker() {
  const { stats, refetch } = useDashboard();
  const [saving, setSaving] = useState(false);
  const current = useGameStore((s) => (s.stats?.meta as { weeklyFocusCategory?: string })?.weeklyFocusCategory) ?? "";

  if (!stats) return null;

  const save = async (slug: string) => {
    setSaving(true);
    await jarvisFetch("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify({ weeklyFocusCategory: slug }),
    });
    setSaving(false);
    refetch();
  };

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-cyan-500/50">Weekly focus category</p>
      <p className="text-[10px] text-cyan-500/40">Spawns a bonus weekly quest for this pillar</p>
      <div className="flex flex-wrap gap-2">
        {stats.categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            disabled={saving}
            onClick={() => void save(cat.slug)}
            className={`text-[10px] px-3 py-1.5 rounded-full border transition-colors ${
              current === cat.slug
                ? "border-cyan-400 bg-cyan-500/15 text-cyan-200"
                : "border-slate-700 text-cyan-400/60 hover:border-cyan-500/30"
            }`}
            style={current === cat.slug ? { borderColor: cat.color } : undefined}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
