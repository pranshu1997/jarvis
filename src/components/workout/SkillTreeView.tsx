"use client";

import { XpBar } from "@/components/effects/XpBar";
import { RankBadge } from "@/components/shared/RankBadge";
import { getSkillTree } from "@/lib/workout-progression";
import { xpProgressInLevel } from "@/lib/xp-engine";
import type { Skill } from "@/types/database";
import { cn } from "@/lib/utils";

type SkillNode = Skill & { children: SkillNode[] };

function SkillNodeRow({
  node,
  depth = 0,
}: {
  node: SkillNode;
  depth?: number;
}) {
  const xp = xpProgressInLevel(node.total_xp, node.level);
  const branchColors: Record<string, string> = {
    workout_root: "border-cyan-400/40",
    workout_branch: "border-cyan-500/25",
    muscle_group: "border-slate-600",
  };

  return (
    <div className={cn(depth > 0 && "ml-4 border-l border-cyan-500/15 pl-3")}>
      <div
        className={cn(
          "rounded-lg border p-3 mb-2",
          branchColors[node.skill_type] ?? "border-slate-700"
        )}
        style={{ borderColor: depth === 0 ? node.color : undefined }}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-cyan-100">{node.name}</p>
            <p className="text-[10px] text-cyan-500/40 capitalize">
              {node.skill_type.replace(/_/g, " ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RankBadge rank={node.rank} size="sm" />
            <span className="text-xs font-mono text-cyan-300">Lv.{node.level}</span>
          </div>
        </div>
        <div className="mt-2">
          <XpBar
            label=""
            current={xp.current}
            required={xp.required}
            percent={xp.percent}
            showValues={false}
            size="sm"
          />
        </div>
      </div>
      {node.children.map((child) => (
        <SkillNodeRow key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function SkillTreeView({ skills }: { skills: Skill[] }) {
  const tree = getSkillTree(skills) as SkillNode[];

  if (!tree.length) {
    return (
      <p className="text-sm text-cyan-500/50">Skill tree loading…</p>
    );
  }

  return (
    <div className="space-y-2">
      {tree.map((root) => (
        <SkillNodeRow key={root.id} node={root} />
      ))}
    </div>
  );
}
