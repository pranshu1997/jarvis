"use client";

import type { Profile, RankTier } from "@/types/database";

const TIERS: Record<RankTier, { label: string; glow: string }> = {
  E: { label: "Civilian", glow: "shadow-none" },
  D: { label: "Hunter", glow: "shadow-[0_0_20px_rgba(0,212,255,0.3)]" },
  C: { label: "Veteran", glow: "shadow-[0_0_24px_rgba(0,212,255,0.5)]" },
  B: { label: "Elite", glow: "shadow-[0_0_28px_rgba(139,92,246,0.5)]" },
  A: { label: "Master", glow: "shadow-[0_0_32px_rgba(139,92,246,0.6)]" },
  S: { label: "Shadow", glow: "shadow-[0_0_36px_rgba(0,0,0,0.8)]" },
  NATIONAL: { label: "National", glow: "shadow-[0_0_40px_rgba(251,191,36,0.5)]" },
  MONARCH: { label: "Monarch", glow: "shadow-[0_0_48px_rgba(168,85,247,0.8)]" },
};

export function CharacterEvolution({ profile }: { profile: Profile }) {
  const tier = TIERS[profile.rank];

  return (
    <div className={`rounded-2xl border border-cyan-500/30 p-6 text-center ${tier.glow}`}>
      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-slate-800 to-cyan-900 border-2 border-cyan-400/50 flex items-center justify-center">
        <span className="font-display text-2xl font-bold text-cyan-200">
          {profile.rank}
        </span>
      </div>
      <p className="mt-3 font-display text-lg text-cyan-100">{tier.label}</p>
      <p className="text-xs text-cyan-500/50">Hunter Lv.{profile.player_level}</p>
      <div className="grid grid-cols-4 gap-2 mt-4 text-[10px] font-mono text-cyan-400/70">
        <div>PWR {profile.power_score}</div>
        <div>DIS {profile.discipline_score}</div>
        <div>MOM {profile.momentum_score}</div>
        <div>CON {profile.consistency_score}</div>
      </div>
    </div>
  );
}
