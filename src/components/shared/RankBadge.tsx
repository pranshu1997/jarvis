import { RANK_COLORS, RANK_LABELS } from "@/lib/xp-engine";
import type { RankTier } from "@/types/database";
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: RankTier;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RankBadge({ rank, size = "md", className }: RankBadgeProps) {
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-mono font-bold uppercase tracking-wider border",
        sizes[size],
        className
      )}
      style={{
        color: RANK_COLORS[rank],
        borderColor: `${RANK_COLORS[rank]}40`,
        backgroundColor: `${RANK_COLORS[rank]}15`,
        boxShadow: `0 0 12px ${RANK_COLORS[rank]}30`,
      }}
    >
      {RANK_LABELS[rank]}
    </span>
  );
}
