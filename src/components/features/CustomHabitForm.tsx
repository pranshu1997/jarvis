"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  computeHabitBaseXp,
  HABIT_BASELINE_SLUG,
  resolveBaselineXp,
} from "@/lib/habit-xp";
import { useToastStore } from "@/stores/toast-store";
import type { Category, Habit } from "@/types/database";
import { cn } from "@/lib/utils";
import { HABIT_PERIODS, type HabitPeriod } from "@/lib/habit-periods";

const CORE_CATEGORIES = [
  { slug: "physical", name: "Physical", color: "#3b82f6" },
  { slug: "mental", name: "Mental", color: "#8b5cf6" },
  { slug: "awareness", name: "Awareness", color: "#06b6d4" },
  { slug: "vitality", name: "Vitality", color: "#22c55e" },
] as const;

export interface CustomHabitFormProps {
  habits: Habit[];
  categories?: Category[];
  onCreated?: (habit: Habit) => void;
  onCancel?: () => void;
  compact?: boolean;
}

export function CustomHabitForm({
  habits,
  onCreated,
  onCancel,
  compact = false,
}: CustomHabitFormProps) {
  const [name, setName] = useState("");
  const [categorySlug, setCategorySlug] = useState<string>("mental");
  const [toughness, setToughness] = useState(1);
  const [baselineSlug, setBaselineSlug] = useState(HABIT_BASELINE_SLUG);
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [preferredPeriod, setPreferredPeriod] = useState<HabitPeriod>("anytime");
  const [saving, setSaving] = useState(false);

  const baselineOptions = useMemo(() => {
    const meditate = habits.find((h) => h.slug === HABIT_BASELINE_SLUG);
    const rest = habits.filter(
      (h) => h.slug !== HABIT_BASELINE_SLUG && h.is_active
    );
    const list = meditate ? [meditate, ...rest] : rest;
    const seen = new Set<string>();
    return list.filter((h) => {
      if (seen.has(h.slug)) return false;
      seen.add(h.slug);
      return true;
    });
  }, [habits]);

  const baselineXp = resolveBaselineXp(habits, baselineSlug);
  const computedXp = computeHabitBaseXp(baselineXp, toughness);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      useToastStore.getState().show("Enter a habit name", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/habits/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          categorySlug,
          toughness,
          baselineSlug,
          targetValue: targetValue ? Number(targetValue) : undefined,
          unit: unit.trim() || undefined,
          preferredPeriod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        useToastStore.getState().show(data.error ?? "Failed to create habit", "error");
        return;
      }
      useToastStore.getState().show(
        `${trimmed} · ${data.baseXp} base XP · ${data.categoryName} Lv.${data.categoryLevel}`,
        "success"
      );
      setName("");
      setToughness(1);
      setTargetValue("");
      setUnit("");
      onCreated?.(data.habit);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      <div>
        <label className="text-xs text-cyan-500/50">Habit name</label>
        <input
          placeholder="e.g. Cold shower, Read 30 min"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50"
        />
      </div>

      <div>
        <label className="text-xs text-cyan-500/50 mb-2 block">Major category</label>
        <div className="grid grid-cols-2 gap-2">
          {CORE_CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategorySlug(c.slug)}
              className={cn(
                "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                categorySlug === c.slug
                  ? "border-cyan-400 bg-cyan-500/15 text-cyan-100"
                  : "border-slate-700 text-cyan-100/50 hover:border-cyan-500/30"
              )}
              style={
                categorySlug === c.slug
                  ? { borderColor: c.color, boxShadow: `0 0 12px ${c.color}33` }
                  : undefined
              }
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-cyan-500/50">Time of day</label>
        <select
          value={preferredPeriod}
          onChange={(e) => setPreferredPeriod(e.target.value as HabitPeriod)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50"
        >
          {HABIT_PERIODS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-cyan-500/50">Baseline habit (1.0× reference)</label>
        <select
          value={baselineSlug}
          onChange={(e) => setBaselineSlug(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50"
        >
          {baselineOptions.map((h) => (
            <option key={h.slug} value={h.slug}>
              {h.name} ({h.base_xp} XP)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-cyan-500/50">
          Toughness vs baseline (Meditate = 1.0×)
        </label>
        <input
          type="range"
          min={0.25}
          max={3}
          step={0.05}
          value={toughness}
          onChange={(e) => setToughness(Number(e.target.value))}
          className="w-full accent-cyan-400 mt-2"
        />
        <div className="flex justify-between text-sm font-mono mt-1">
          <span className="text-cyan-400">{toughness.toFixed(2)}×</span>
          <span className="text-cyan-300">
            {baselineXp} × {toughness.toFixed(2)} ={" "}
            <strong className="text-cyan-100">{computedXp} base XP</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-cyan-500/50">Daily target (optional)</label>
          <input
            type="number"
            placeholder="e.g. 10000"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50"
          />
        </div>
        <div>
          <label className="text-xs text-cyan-500/50">Unit (optional)</label>
          <input
            placeholder="steps, min, L"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50"
          />
        </div>
      </div>

      <p className="text-[11px] text-cyan-500/40 leading-relaxed">
        Category level includes earned XP plus 12% of your habit portfolio base XP in
        that category — adding a tougher habit raises the category immediately.
      </p>

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="button"
          variant="hologram"
          className="flex-1"
          disabled={saving || !name.trim()}
          onClick={() => void submit()}
        >
          {saving ? "Creating…" : "+ Create Habit"}
        </Button>
      </div>
    </div>
  );
}
