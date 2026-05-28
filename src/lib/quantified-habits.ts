import type { Habit } from "@/types/database";

export interface AdjustPreset {
  delta: number;
  label: string;
}

export const STEP_TARGET_OPTIONS = [2000, 3000, 4000, 5000, 7500, 10000] as const;
export const WATER_TARGET_OPTIONS = [4, 5, 6, 8, 10, 12] as const;

const SLUG_PRESETS: Record<
  string,
  { increase: AdjustPreset[]; decrease: AdjustPreset[] }
> = {
  steps_5k: {
    increase: [
      { delta: 500, label: "+500" },
      { delta: 1000, label: "+1k" },
      { delta: 2500, label: "+2.5k" },
    ],
    decrease: [
      { delta: -500, label: "−500" },
      { delta: -1000, label: "−1k" },
      { delta: -2500, label: "−2.5k" },
    ],
  },
  water_intake: {
    increase: [
      { delta: 1, label: "+1" },
      { delta: 2, label: "+2" },
    ],
    decrease: [
      { delta: -1, label: "−1" },
      { delta: -2, label: "−2" },
    ],
  },
  sleep: {
    increase: [
      { delta: 0.5, label: "+30m" },
      { delta: 1, label: "+1h" },
    ],
    decrease: [
      { delta: -0.5, label: "−30m" },
      { delta: -1, label: "−1h" },
    ],
  },
};

export function getAdjustPresets(habit: Habit): {
  increase: AdjustPreset[];
  decrease: AdjustPreset[];
} {
  const slug = habit.slug.replace(/-\w+$/, ""); // custom habits: steps_5k-abc1 → try base
  const baseSlug = habit.slug.split("-")[0];
  const match =
    SLUG_PRESETS[habit.slug] ??
    SLUG_PRESETS[baseSlug] ??
    SLUG_PRESETS[slug];

  if (match) return match;

  const target = habit.target_value ?? 10;
  const step =
    habit.unit === "steps"
      ? 500
      : habit.unit === "glasses"
        ? 1
        : Math.max(1, Math.ceil(target / 4));

  return {
    increase: [
      { delta: step, label: `+${step}` },
      { delta: step * 2, label: `+${step * 2}` },
    ],
    decrease: [
      { delta: -step, label: `−${step}` },
      { delta: -step * 2, label: `−${step * 2}` },
    ],
  };
}

export function formatStepsTarget(n: number): string {
  if (n >= 1000) return `${n / 1000}k`;
  return String(n);
}

export function stepsHabitDisplayName(target: number): string {
  return `Steps ${formatStepsTarget(target)}`;
}

export const CONFIGURABLE_TARGET_SLUGS = [
  "steps_5k",
  "water_intake",
  "sleep",
] as const;

export function getTargetOptionsForHabit(habit: Habit): number[] {
  if (habit.slug.startsWith("steps") || habit.unit === "steps") {
    return [...STEP_TARGET_OPTIONS];
  }
  if (habit.slug.startsWith("water") || habit.unit === "glasses") {
    return [...WATER_TARGET_OPTIONS];
  }
  if (habit.slug === "sleep" || habit.unit === "hours") {
    return [6, 7, 7.5, 8, 8.5, 9];
  }
  if (habit.target_value) {
    const t = habit.target_value;
    return [Math.round(t * 0.5), Math.round(t * 0.75), t, Math.round(t * 1.25)];
  }
  return [];
}

export function isConfigurableQuantifiedHabit(habit: Habit): boolean {
  if (!habit.target_value) return false;
  if (habit.slug.startsWith("steps") || habit.unit === "steps") return true;
  if (habit.slug.startsWith("water") || habit.unit === "glasses") return true;
  if (habit.slug === "sleep" || habit.unit === "hours") return true;
  return getTargetOptionsForHabit(habit).length > 0;
}
