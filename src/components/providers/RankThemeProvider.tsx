"use client";

import { useEffect, type ReactNode } from "react";
import { useGameStore } from "@/stores/game-store";
import { getRankTheme, rankThemeToCssVars } from "@/lib/rank-theme";

export function RankThemeProvider({ children }: { children: ReactNode }) {
  const rank = useGameStore((s) => s.stats?.profile?.rank);

  useEffect(() => {
    if (!rank) return;
    const theme = getRankTheme(rank);
    const vars = rankThemeToCssVars(theme);
    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
  }, [rank]);

  return <>{children}</>;
}
