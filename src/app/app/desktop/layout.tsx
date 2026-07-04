"use client";

import { DesktopSidebar } from "@/components/desktop/DesktopSidebar";
import { ParticleField } from "@/components/effects/ParticleField";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useKeyboardShortcuts({ enabled: true });

  return (
    <div className="min-h-dvh hud-grid">
      <ParticleField count={25} />
      <DesktopSidebar />
      <main className="ml-64 min-h-dvh relative z-10">{children}</main>
    </div>
  );
}
