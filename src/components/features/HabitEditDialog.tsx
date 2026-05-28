"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HABIT_PERIODS, type HabitPeriod } from "@/lib/habit-periods";
import { jarvisFetch } from "@/lib/api-client";
import { useToastStore } from "@/stores/toast-store";
import type { Habit } from "@/types/database";

export function HabitEditDialog({
  habit,
  onDone,
  onClose,
}: {
  habit: Habit;
  onDone: () => void;
  onClose: () => void;
}) {
  const meta = habit.metadata as { category_slug?: string; toughness?: number };
  const [name, setName] = useState(habit.name);
  const [categorySlug, setCategorySlug] = useState(meta.category_slug ?? "mental");
  const [toughness, setToughness] = useState(meta.toughness ?? 1);
  const [period, setPeriod] = useState<HabitPeriod>(
    (meta as { preferred_period?: HabitPeriod }).preferred_period ?? "anytime"
  );

  const save = async () => {
    const res = await jarvisFetch("/api/habits/update", {
      method: "PATCH",
      body: JSON.stringify({ habitId: habit.id, name, categorySlug, toughness, preferredPeriod: period }),
    });
    if (!res.ok) {
      const d = await res.json();
      useToastStore.getState().show(d.error ?? "Failed", "error");
      return;
    }
    useToastStore.getState().show("Habit updated", "success");
    onDone();
    onClose();
  };

  const archive = async () => {
    const res = await jarvisFetch("/api/habits/archive", {
      method: "POST",
      body: JSON.stringify({ habitId: habit.id, archived: true }),
    });
    if (!res.ok) {
      useToastStore.getState().show("Failed to archive", "error");
      return;
    }
    useToastStore.getState().show("Habit archived", "info");
    onDone();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-cyan-500/30 bg-slate-950 p-5 space-y-4">
        <h3 className="font-display font-semibold text-cyan-100">Edit habit</h3>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50"
        />
        <select
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50"
        >
          {["physical", "mental", "awareness", "vitality"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as HabitPeriod)}
          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50"
        >
          {HABIT_PERIODS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        {!habit.is_system && (
          <div>
            <label className="text-xs text-cyan-500/50">Toughness</label>
            <input
              type="range"
              min={0.25}
              max={3}
              step={0.05}
              value={toughness}
              onChange={(e) => setToughness(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="hologram" className="flex-1" onClick={() => void save()}>
            Save
          </Button>
        </div>
        <Button variant="outline" className="w-full text-amber-400/80" onClick={() => void archive()}>
          Archive habit
        </Button>
      </div>
    </div>
  );
}
