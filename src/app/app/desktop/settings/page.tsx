"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DesktopSettingsPage() {
  const [baseXp, setBaseXp] = useState(10);
  const [streakBonus, setStreakBonus] = useState(true);

  return (
    <div className="p-8 space-y-8 max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-bold text-cyan-100">
          Settings
        </h1>
        <p className="text-cyan-500/50 mt-1">
          Configure habits, categories, quests, and XP logic
        </p>
      </header>

      <Card glow>
        <CardHeader>
          <CardTitle>XP Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-cyan-500/50">Default Base XP</label>
            <input
              type="range"
              min={5}
              max={50}
              value={baseXp}
              onChange={(e) => setBaseXp(Number(e.target.value))}
              className="w-full mt-2 accent-cyan-400"
            />
            <p className="text-right font-mono text-cyan-300">{baseXp} XP</p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={streakBonus}
              onChange={(e) => setStreakBonus(e.target.checked)}
              className="accent-cyan-400"
            />
            <span className="text-cyan-100/80">Enable streak multipliers</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Systems</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="hologram" className="w-full">
            + Add Custom Habit
          </Button>
          <Button variant="hologram" className="w-full">
            + Add Custom Category
          </Button>
          <Button variant="hologram" className="w-full">
            + Add Custom Quest
          </Button>
          <p className="text-xs text-cyan-500/40 text-center mt-2">
            Custom items are stored in your Supabase database per-user
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Streak Logic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-cyan-100/60 font-mono">
            <p>3+ days: 1.5× · 7+ days: 1.75× · 14+ days: 2.0× · 30+ days: 2.5×</p>
            <p>Perfect day bonus: 1.5× · Category complete: 1.25×</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
