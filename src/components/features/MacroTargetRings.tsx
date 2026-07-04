"use client";

import { useGameStore } from "@/stores/game-store";
import { getExtended } from "@/lib/player-settings-extended";
import { todayISO } from "@/lib/utils";

export function MacroTargetRings() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  const ext = getExtended(stats.profile);
  const targets = ext.macro_targets ?? { protein: 150, calories: 2200, carbs: 200, fat: 70 };
  const today = ext.macro_logs?.find((l) => l.date === todayISO()) ?? { protein: 0, calories: 0 };

  const rings = [
    { label: "Protein", current: today.protein, target: targets.protein, color: "#22d3ee" },
    { label: "Calories", current: today.calories, target: targets.calories, color: "#fbbf24" },
  ];

  return (
    <div className="flex gap-6 justify-center">
      {rings.map(({ label, current, target, color }) => {
        const pct = Math.min(100, Math.round((current / Math.max(target, 1)) * 100));
        const r = 36;
        const circ = 2 * Math.PI * r;
        const offset = circ - (pct / 100) * circ;
        return (
          <div key={label} className="text-center">
            <svg width="88" height="88" className="-rotate-90">
              <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="6" />
              <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <p className="text-[10px] text-cyan-500/50 -mt-12 relative">{pct}%</p>
            <p className="text-xs text-cyan-300 mt-8">{label}</p>
            <p className="text-[10px] text-cyan-500/40">{current}/{target}</p>
          </div>
        );
      })}
    </div>
  );
}
