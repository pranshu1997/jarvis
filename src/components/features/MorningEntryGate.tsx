"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGameStore } from "@/stores/game-store";
import { getExtended } from "@/lib/player-settings-extended";

export function MorningEntryGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const stats = useGameStore((s) => s.stats);

  useEffect(() => {
    if (!stats || typeof window === "undefined") return;
    const hour = new Date().getHours();
    if (hour >= 11) return;

    const morningMode = getExtended(stats.profile).morning_mode !== false;
    if (!morningMode) return;

    const incomplete = stats.habits.some((h) => h.is_active && !h.completed_today);
    if (!incomplete) return;

    if (
      pathname.startsWith("/app/mobile") &&
      pathname !== "/app/mobile/today" &&
      !pathname.includes("/login")
    ) {
      router.replace("/app/mobile/today");
    }
  }, [stats, pathname, router]);

  return <>{children}</>;
}
