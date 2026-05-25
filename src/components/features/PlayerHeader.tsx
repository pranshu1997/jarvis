"use client";

import { motion } from "framer-motion";
import { RankBadge } from "@/components/shared/RankBadge";
import { XpBar } from "@/components/effects/XpBar";
import { xpProgressInLevel } from "@/lib/xp-engine";
import { formatNumber } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface PlayerHeaderProps {
  profile: Profile;
  variant?: "desktop" | "mobile";
}

export function PlayerHeader({ profile, variant = "desktop" }: PlayerHeaderProps) {
  const xp = xpProgressInLevel(profile.total_xp, profile.player_level);

  if (variant === "mobile") {
    return (
      <div className="glass rounded-2xl p-4 glow-cyan">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-500/50">
              Hunter Status
            </p>
            <h2 className="font-display text-xl font-bold text-cyan-100">
              {profile.display_name ?? "Hunter"}
            </h2>
          </div>
          <RankBadge rank={profile.rank} />
        </div>
        <XpBar
          label="Player Level"
          current={xp.current}
          required={xp.required}
          percent={xp.percent}
          level={profile.player_level}
        />
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[
            { label: "Power", value: profile.power_score },
            { label: "Disc.", value: profile.discipline_score },
            { label: "Mom.", value: profile.momentum_score },
            { label: "Cons.", value: profile.consistency_score },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[9px] text-cyan-500/40">{s.label}</p>
              <p className="text-sm font-mono text-cyan-300">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 glow-cyan"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-500/50 mb-2">
            System Status — Online
          </p>
          <h2 className="font-display text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-400">
            {profile.display_name ?? "Hunter"}
          </h2>
          <p className="text-sm text-cyan-500/50 mt-1 font-mono">
            {formatNumber(profile.total_xp)} Total XP
          </p>
        </div>
        <RankBadge rank={profile.rank} size="lg" />
      </div>
      <div className="mt-6">
        <XpBar
          label="Evolution Progress"
          current={xp.current}
          required={xp.required}
          percent={xp.percent}
          level={profile.player_level}
          size="lg"
        />
      </div>
    </motion.div>
  );
}
