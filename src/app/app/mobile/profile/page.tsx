"use client";

import Link from "next/link";
import { PlayerHeader } from "@/components/features/PlayerHeader";
import { ProfileCustomizer } from "@/components/features/ProfileCustomizer";
import { ProfileTitlePicker } from "@/components/features/ProfileTitlePicker";
import { EvolutionGoalPanel } from "@/components/features/EvolutionGoalPanel";
import { ResilienceBadge } from "@/components/features/ResilienceBadge";
import { useGameStore } from "@/stores/game-store";
import { Settings, Monitor } from "lucide-react";

export default function MobileProfilePage() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  return (
    <div className="space-y-6 pt-4">
      <PlayerHeader profile={stats.profile} variant="mobile" />
      <ResilienceBadge />
      <ProfileTitlePicker />
      <EvolutionGoalPanel />
      <ProfileCustomizer />
      <div className="space-y-2">
        <Link
          href="/app/desktop/dashboard"
          className="flex items-center gap-3 p-4 glass rounded-xl"
        >
          <Monitor className="w-5 h-5 text-cyan-400" />
          <span className="text-cyan-100">Command Center (Desktop)</span>
        </Link>
        <Link
          href="/app/desktop/settings"
          className="flex items-center gap-3 p-4 glass rounded-xl"
        >
          <Settings className="w-5 h-5 text-cyan-400" />
          <span className="text-cyan-100">Settings</span>
        </Link>
      </div>
    </div>
  );
}
