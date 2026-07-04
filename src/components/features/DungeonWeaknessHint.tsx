"use client";

import { useGameStore } from "@/stores/game-store";
import { Sword } from "lucide-react";

const WEAKNESS_MAP: Record<string, string> = {
  physical: "Strength training & movement habits deal bonus damage",
  mental: "Focus & learning habits deal bonus damage",
  awareness: "Mindfulness & reflection habits deal bonus damage",
  vitality: "Sleep & nutrition habits deal bonus damage",
};

export function DungeonWeaknessHint() {
  const dungeon = useGameStore((s) => (s.stats?.meta as { dungeon?: { title: string; boss_hp: number; boss_hp_max: number } | null })?.dungeon);
  const categories = useGameStore((s) => s.stats?.categories ?? []);

  if (!dungeon || dungeon.boss_hp <= 0) return null;

  const weakest = [...categories].sort((a, b) => a.total_xp - b.total_xp)[0]?.slug ?? "physical";
  const hint = WEAKNESS_MAP[weakest] ?? "Complete habits in your weakest category";

  const pct = Math.round((1 - dungeon.boss_hp / dungeon.boss_hp_max) * 100);

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <Sword className="w-3.5 h-3.5 text-red-400" />
        <p className="text-xs uppercase tracking-widest text-red-400/70">Weakness: {weakest}</p>
      </div>
      <p className="text-xs text-red-200/80">{hint}</p>
      <div className="mt-2 h-1.5 rounded-full bg-red-950 overflow-hidden">
        <div className="h-full bg-red-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
