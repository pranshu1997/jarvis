"use client";

import { DesktopSidebar } from "@/components/desktop/DesktopSidebar";
import { ParticleField } from "@/components/effects/ParticleField";
import { useDashboard } from "@/hooks/useDashboard";

export default function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useDashboard();

  return (
    <div className="min-h-dvh hud-grid">
      <ParticleField count={25} />
      <DesktopSidebar />
      <main className="ml-64 min-h-dvh relative z-10">{children}</main>
    </div>
  );
}
