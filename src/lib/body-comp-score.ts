import type { BodyMeasurement } from "@/lib/player-settings-extended";

export function computeBodyCompScore(
  measurements: BodyMeasurement[],
  weightKg?: number
): { score: number; trend: string; waistDelta?: number } {
  if (measurements.length === 0) return { score: 0, trend: "No data" };

  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1]!;
  const earliest = sorted[0]!;

  let score = 50;
  if (latest.body_fat_pct != null) {
    score = Math.max(0, Math.min(100, 100 - latest.body_fat_pct));
  }

  let waistDelta: number | undefined;
  if (latest.waist != null && earliest.waist != null) {
    waistDelta = Math.round((earliest.waist - latest.waist) * 10) / 10;
    if (waistDelta > 0) score += Math.min(15, waistDelta * 3);
    else if (waistDelta < 0) score -= Math.min(10, Math.abs(waistDelta) * 2);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let trend = "Stable";
  if (waistDelta != null && waistDelta >= 1) trend = `Waist −${waistDelta}" progress`;
  else if (waistDelta != null && waistDelta <= -1) trend = `Waist +${Math.abs(waistDelta)}" — refocus`;

  return { score, trend, waistDelta };
}
