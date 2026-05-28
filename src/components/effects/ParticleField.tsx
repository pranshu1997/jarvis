"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/** Deterministic 0–1 from index so SSR and client match (avoids hydration mismatch). */
function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function ParticleField({ count = 40 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: seeded(i * 4 + 1) * 100,
        y: seeded(i * 4 + 2) * 100,
        size: seeded(i * 4 + 3) * 3 + 1,
        duration: seeded(i * 4 + 4) * 4 + 3,
        delay: seeded(i * 4 + 5) * 2,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            opacity: [0.1, 0.6, 0.1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
