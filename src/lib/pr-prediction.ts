/** Estimated 1RM using Epley formula: weight * (1 + reps/30) */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function predictPR(
  history: { weight: number; reps: number; date: string }[]
): { estimated1RM: number; trend: "up" | "flat" | "down"; delta: number } {
  if (history.length === 0) return { estimated1RM: 0, trend: "flat", delta: 0 };

  const estimates = history.map((h) => estimate1RM(h.weight, h.reps));
  const latest = estimates[estimates.length - 1] ?? 0;
  const prev = estimates.length > 1 ? estimates[estimates.length - 2] ?? latest : latest;
  const delta = Math.round((latest - prev) * 10) / 10;

  return {
    estimated1RM: latest,
    trend: delta > 0.5 ? "up" : delta < -0.5 ? "down" : "flat",
    delta,
  };
}
