"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores/game-store";
import { applyHudTheme } from "@/lib/cosmetics";

export function CosmeticApplier() {
  const profile = useGameStore((s) => s.stats?.profile);

  useEffect(() => {
    if (profile) applyHudTheme(profile);
  }, [profile]);

  return null;
}
