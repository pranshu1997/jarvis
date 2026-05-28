import type { DashboardStats, Skill, Exercise } from "@/types/database";
import { levelFromXp, rankFromLevel } from "@/lib/xp-engine";

export function rollupSkillTree(skills: Skill[]): void {
  const byId = Object.fromEntries(skills.map((s) => [s.id, s]));

  const childrenOf = (parentId: string | null) =>
    skills.filter((s) => s.parent_id === parentId);

  function rollupNode(skill: Skill): number {
    const children = childrenOf(skill.id);
    let childXp = 0;
    for (const child of children) {
      childXp += rollupNode(child);
    }
    if (children.length > 0) {
      skill.total_xp = Math.max(skill.total_xp, childXp);
    }
    skill.level = levelFromXp(skill.total_xp);
    skill.rank = rankFromLevel(skill.level);
    return skill.total_xp;
  }

  const roots = skills.filter((s) => !s.parent_id || !byId[s.parent_id ?? ""]);
  for (const root of roots) {
    rollupNode(root);
  }
}

export function applyExerciseXpToSkills(
  state: DashboardStats,
  exercise: Exercise,
  xpEarned: number
): void {
  if (!exercise.skill_id || !state.skills) return;

  const skill = state.skills.find((s) => s.id === exercise.skill_id);
  if (skill) {
    skill.total_xp += xpEarned;
    skill.level = levelFromXp(skill.total_xp);
    skill.rank = rankFromLevel(skill.level);
  }

  rollupSkillTree(state.skills);

  const sportsBranch = state.skills.find((s) => s.slug === "sports_branch");
  if (sportsBranch && exercise.skill_id !== sportsBranch.id) {
    // strength path — also bump workout root via rollup
  }
}

export function getSkillTree(
  skills: Skill[],
  parentId: string | null = null
): (Skill & { children: Skill[] })[] {
  return skills
    .filter((s) => s.parent_id === parentId)
    .sort(
      (a, b) =>
        ((a.metadata.sort_order as number) ?? 0) -
        ((b.metadata.sort_order as number) ?? 0)
    )
    .map((s) => ({
      ...s,
      children: getSkillTree(skills, s.id) as Skill[],
    }));
}

export function getActiveSession(state: DashboardStats) {
  return state.workoutSessions?.find((s) => s.is_active) ?? null;
}
