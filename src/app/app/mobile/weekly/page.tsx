"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { jarvisFetch } from "@/lib/api-client";
import { getWeekKey, getPlayerSettings } from "@/lib/player-settings";
import { useToastStore } from "@/stores/toast-store";
import { CalendarDays, Zap, Flame, Target, Share2, Printer } from "lucide-react";
import { WeeklyFocusCategoryPicker } from "@/components/features/WeeklyFocusCategoryPicker";
import { PerfectWeekCountdown } from "@/components/features/PerfectWeekCountdown";
import { EvolutionGoalPanel } from "@/components/features/EvolutionGoalPanel";

export default function MobileWeeklyPage() {
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
    <div className="space-y-6 pt-4">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-cyan-100">Weekly Review</h1>
          <p className="text-[11px] text-cyan-500/50">Week {getWeekKey()} · Plan evolution</p>
          <div className="flex gap-3 mt-2">
            <a href="/api/share/weekly" target="_blank" rel="noopener noreferrer" className="text-[10px] flex items-center gap-1 text-cyan-400">
              <Share2 className="w-3 h-3" /> Share
            </a>
            <a href="/api/reports/print" target="_blank" rel="noopener noreferrer" className="text-[10px] flex items-center gap-1 text-cyan-400">
              <Printer className="w-3 h-3" /> Print
            </a>
          </div>
        </div>
      </header>

      <PerfectWeekCountdown />
      <WeeklyFocusCategoryPicker />
      <EvolutionGoalPanel />

      <div className="grid grid-cols-2 gap-3">
        <Card glow>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs font-mono text-cyan-300">
            <p>+{weekXp} XP</p>
            <p>{perfectDays.length} perfect days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Top Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-cyan-300 font-mono">
            <p>{topStreak?.name ?? "—"}</p>
            <p className="text-cyan-500/50">{topStreak?.current_streak ?? 0} days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-red-400" />
            Weakest Category
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-cyan-100/70">
          <strong>{weakest?.name}</strong>
          <span className="text-cyan-500/50 ml-2">Lv.{weakest?.level}</span>
        </CardContent>
      </Card>

      <Card glow>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Next week&apos;s focus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.weekly_focus && (
            <p className="text-xs text-cyan-500/50 border-l-2 border-cyan-500/30 pl-2">
              {settings.weekly_focus}
            </p>
          )}
          <textarea
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g. Sleep 7h, hit gym 4×, perfect Physical"
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 text-sm resize-none"
          />
          <Button variant="hologram" size="sm" className="w-full" onClick={() => void saveFocus()}>
            Save weekly focus
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
