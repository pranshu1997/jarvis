"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores/game-store";
import { getExtended } from "@/lib/player-settings-extended";

export function ParticleBoostOverlay() {
  const stats = useGameStore((s) => s.stats);

  useEffect(() => {
    if (!stats) return;
    const owned = getExtended(stats.profile).cosmetics_owned ?? [];
    const root = document.documentElement;
    if (owned.includes("particles-boost")) {
      root.classList.add("particle-boost-active");
    } else {
      root.classList.remove("particle-boost-active");
    }
    return () => root.classList.remove("particle-boost-active");
  }, [stats]);

  return null;
}
