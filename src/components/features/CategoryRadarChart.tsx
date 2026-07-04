"use client";

import { useGameStore } from "@/stores/game-store";
import { categoryBalance } from "@/lib/analytics-correlation";

export function CategoryRadarChart() {
  const stats = useGameStore((s) => s.stats);
  if (!stats) return null;

  const balance = categoryBalance(stats);
  const entries = Object.entries(balance);
  const size = 160;
  const center = size / 2;
  const maxR = 60;
  const angleStep = (2 * Math.PI) / entries.length;

  const points = entries.map(([, pct], i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (pct / 100) * maxR;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(" ");

  const gridPoints = entries.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = maxR;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <polygon points={gridPoints} fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
        <polygon points={points} fill="rgba(6,182,212,0.2)" stroke="#22d3ee" strokeWidth="2" />
        {entries.map(([slug, pct], i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + (maxR + 14) * Math.cos(angle);
          const y = center + (maxR + 14) * Math.sin(angle);
          return (
            <text key={slug} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#67e8f9" fontSize="8">
              {slug.slice(0, 3)} {pct}%
            </text>
          );
        })}
      </svg>
    </div>
  );
}
