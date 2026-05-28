"use client";

import Link from "next/link";
import { useDashboard } from "@/hooks/useDashboard";
import { filterHabitsByPeriod, getCurrentPeriod } from "@/lib/habit-periods";
import { Button } from "@/components/ui/button";

export default function MobileTodayPage() {
  const { stats, completeHabit, toggleSupplement, isLoading } = useDashboard();

  if (isLoading || !stats) return null;

  const period = getCurrentPeriod();
  const habits = filterHabitsByPeriod(
    stats.habits.filter(
      (h) =>
        h.is_active &&
        !h.completed_today &&
        !(h.metadata as { skipped_today?: boolean }).skipped_today
    ),
    period
  ).slice(0, 4);

  const sups = stats.supplements.filter((s) => !s.taken_today).slice(0, 3);

  return (
    <div className="min-h-dvh p-4 pt-8 pb-8 space-y-4 bg-slate-950">
      <p className="text-xs uppercase tracking-[0.4em] text-cyan-500/50 text-center">
        Today
      </p>
      <h1 className="font-display text-2xl font-bold text-cyan-100 text-center capitalize">
        {period}
      </h1>

      <div className="space-y-2">
        {habits.map((h) => (
          <Button
            key={h.id}
            variant="hologram"
            className="w-full h-14 text-lg justify-start px-6"
            onClick={() => void completeHabit(h.id, true)}
          >
            {h.name}
          </Button>
        ))}
      </div>

      {sups.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-cyan-500/20">
          {sups.map((s) => (
            <Button
              key={s.id}
              variant="outline"
              className="w-full"
              onClick={() => void toggleSupplement(s.id, true)}
            >
              {s.name}
            </Button>
          ))}
        </div>
      )}

      <Link
        href="/app/mobile/dashboard"
        className="block text-center text-sm text-cyan-500/50 pt-6"
      >
        Open full HUD →
      </Link>
    </div>
  );
}
