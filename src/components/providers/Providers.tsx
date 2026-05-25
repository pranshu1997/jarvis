"use client";

import { LevelUpOverlay } from "@/components/effects/LevelUpOverlay";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LevelUpOverlay />
    </>
  );
}
