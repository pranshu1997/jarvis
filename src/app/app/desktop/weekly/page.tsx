"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { jarvisFetch } from "@/lib/api-client";
import { getWeekKey, getPlayerSettings } from "@/lib/player-settings";
import { useToastStore } from "@/stores/toast-store";
import { WeeklyShareButton } from "@/components/features/WeeklyShareButton";
import { PrintableDossierButton } from "@/components/features/PrintableDossierButton";
import { PerfectWeekCountdown } from "@/components/features/PerfectWeekCountdown";
import { WeeklyFocusCategoryPicker } from "@/components/features/WeeklyFocusCategoryPicker";
import { CalendarSubscribeButton } from "@/components/features/CalendarSubscribeButton";

export default function WeeklyReviewPage() {
  const stats = useGameStore((s) => s.stats);
  const { refetch, isLoading } = useDashboard();
  const [focus, setFocus] = useState(
    () => (stats?.profile.settings as { weekly_focus?: string })?.weekly_focus ?? ""
  );

  if (isLoading || !stats) return null;

  const perfectDays =
    (stats.dailyCompletion?.metadata?.perfect_days_week as string[]) ?? [];
  const weekXp = stats.recentXpEvents
    .filter((e) => {
      const d = new Date(e.created_at);
      const now = new Date();
      const diff = (now.getTime() - d.getTime()) / 86400000;
      return diff < 7;
    })
    .reduce((s, e) => s + e.final_xp, 0);

  const topStreak = [...stats.habits]
    .filter((h) => h.is_active)
    .sort((a, b) => b.current_streak - a.current_streak)[0];

  const weakest = [...stats.categories].sort(
    (a, b) => a.total_xp - b.total_xp
  )[0];

  const saveFocus = async () => {
    await jarvisFetch("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify({ weeklyFocus: focus }),
    });
    useToastStore.getState().show("Weekly focus saved", "success");
    refetch();
  };

  const settings = getPlayerSettings(stats.profile);

  return (
    <div className="p-8 space-y-8 max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-bold text-cyan-100">
          Weekly Review
        </h1>
        <p className="text-cyan-500/50 mt-1">Week {getWeekKey()} · Plan next evolution</p>
        <div className="flex flex-wrap gap-4 mt-3">
          <WeeklyShareButton />
          <PrintableDossierButton />
        </div>
      </header>

      <PerfectWeekCountdown />

      <WeeklyFocusCategoryPicker />
      <CalendarSubscribeButton />

      <div className="grid grid-cols-2 gap-4">
        <Card glow>
          <CardHeader>
            <CardTitle className="text-base">This week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm font-mono text-cyan-300">
            <p>+{weekXp} XP earned</p>
            <p>{perfectDays.length} perfect days</p>
            <p>
              Top streak: {topStreak?.name ?? "—"} ({topStreak?.current_streak ?? 0}d)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Focus area</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-cyan-100/70">
              Weakest category: <strong>{weakest?.name}</strong> (Lv.
              {weakest?.level})
            </p>
          </CardContent>
        </Card>
      </div>

      <Card glow>
        <CardHeader>
          <CardTitle>Next week&apos;s focus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.weekly_focus && (
            <p className="text-sm text-cyan-500/50">
              Current: {settings.weekly_focus}
            </p>
          )}
          <input
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g. Sleep 7h, hit gym 4×, perfect Physical"
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50"
          />
          <Button variant="hologram" onClick={() => void saveFocus()}>
            Save weekly focus
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
