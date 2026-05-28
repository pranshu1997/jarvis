"use client";

import { MobileNav } from "@/components/mobile/MobileNav";
import { ParticleField } from "@/components/effects/ParticleField";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh pb-20 relative overflow-x-hidden">
      <ParticleField count={20} />
      <main className="relative z-10 px-4 pt-safe pb-4">{children}</main>
      <MobileNav />
    </div>
  );
}
