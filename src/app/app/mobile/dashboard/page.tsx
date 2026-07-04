"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PlayerHeader } from "@/components/features/PlayerHeader";
import { QuestPanel } from "@/components/features/QuestPanel";
import { SupplementStack } from "@/components/features/SupplementStack";
import { ProtocolStrip } from "@/components/features/ProtocolStrip";
import { QuantifiedRings } from "@/components/features/QuantifiedRings";
import { QuantifiedProgressPanel } from "@/components/features/QuantifiedProgressPanel";
import { SwipeHabitList } from "@/components/features/SwipeHabitList";
import { CategoryCompleteCelebration } from "@/components/features/CategoryCompleteCelebration";
import { useDashboard } from "@/hooks/useDashboard";
import { ComboMeter } from "@/components/features/ComboMeter";
import { ActiveQuestPin } from "@/components/features/ActiveQuestPin";
import { SkipHabitDialog } from "@/components/features/SkipHabitDialog";
import { ReadinessStrip } from "@/components/features/ReadinessStrip";
import { DungeonBossBar } from "@/components/features/DungeonBossBar";
import { DungeonWeaknessHint } from "@/components/features/DungeonWeaknessHint";
import { StreakShieldPanel } from "@/components/features/StreakShieldPanel";
import type { ReadinessEntry } from "@/lib/player-settings-extended";
import { Flame, Zap, Sun, Bot, Trophy } from "lucide-react";
import { SkeletonMobileDashboard } from "@/components/ui/SkeletonLoader";
import { SyncIndicator } from "@/components/features/SyncIndicator";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { TodayIntentionInput } from "@/components/features/TodayIntentionInput";
import { StreakCalendarMini } from "@/components/features/StreakCalendarMini";
import { BossRushPanel } from "@/components/features/BossRushPanel";
import { GuildWarBanner } from "@/components/features/GuildWarBanner";
import { MorningRitualStrip } from "@/components/features/MorningRitualStrip";
import { NextBestActionChip } from "@/components/features/NextBestActionChip";
import { PerfectWeekCountdown } from "@/components/features/PerfectWeekCountdown";
import { DeloadWeekBanner } from "@/components/features/DeloadWeekBanner";
import { AppOpenStreakBadge } from "@/components/features/AppOpenStreakBadge";
import { SnoozedHabitsBanner } from "@/components/features/SnoozedHabitsBanner";
import { AtRiskHabitsPanel } from "@/components/features/AtRiskHabitsPanel";
import { XpForecastCard } from "@/components/features/XpForecastCard";
import { YesterdayCompareChip } from "@/components/features/YesterdayCompareChip";
import { EveningWindDownStrip } from "@/components/features/EveningWindDownStrip";
import { HealthSyncMiniBanner } from "@/components/features/HealthSyncMiniBanner";
import { HydrationQuickLog } from "@/components/features/HydrationQuickLog";
import { CompleteNextFab } from "@/components/mobile/CompleteNextFab";
import { jarvisFetch } from "@/lib/api-client";
import { RankProgressMeter } from "@/components/features/RankProgressMeter";
import { QuickWinsPanel } from "@/components/features/QuickWinsPanel";
import { DailyWinInput } from "@/components/features/DailyWinInput";
import { ComboWarningBanner } from "@/components/features/ComboWarningBanner";
import { CategoryBalanceChip } from "@/components/features/CategoryBalanceChip";
import { StallingCategoriesPanel } from "@/components/features/StallingCategoriesPanel";
import { PinnedQuestPicker } from "@/components/features/PinnedQuestPicker";

export default function MobileDashboard() {
  const [skipTarget, setSkipTarget] = useState<{ id: string; name: string } | null>(
    null
  );
  const {
    stats,
    completeHabit,
    skipHabit,
    incrementHabit,
    toggleSupplement,
    completeCategory,
    categoryCelebration,
    dismissCategoryCelebration,
    refetch,
    isLoading,
  } = useDashboard();

  if (isLoading || !stats) {
    return <SkeletonMobileDashboard />;
  }

  const dailyQuests = stats.quests.filter((q) => q.quest_type === "daily");
  const incomplete = stats.habits.filter((h) => h.is_active && !h.completed_today);

  return (
    <PullToRefresh onRefresh={refetch}>
    <div className="space-y-6 pt-4">
      <CategoryCompleteCelebration
        categoryName={categoryCelebration}
        onDismiss={dismissCategoryCelebration}
      />
      <PlayerHeader profile={stats.profile} variant="mobile" />
      <MorningRitualStrip onLogged={refetch} />
      <NextBestActionChip />
      <YesterdayCompareChip />
      <SnoozedHabitsBanner />
      <HealthSyncMiniBanner />
      <PerfectWeekCountdown />
      <DeloadWeekBanner />
      <CategoryBalanceChip />
      <ComboWarningBanner />
      <StallingCategoriesPanel />
      <PinnedQuestPicker />
      <RankProgressMeter />
      <QuickWinsPanel />
      <DailyWinInput />
      <AtRiskHabitsPanel />
      <XpForecastCard />
      <HydrationQuickLog />
      <EveningWindDownStrip />
      <TodayIntentionInput />
      <GuildWarBanner />
      <div className="flex items-center justify-between">
        <AppOpenStreakBadge />
        <SyncIndicator onRefresh={refetch} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ComboMeter stats={stats} />
        <div className="flex items-center gap-2">
          <Link
            href="/app/mobile/coach"
            className="text-xs flex items-center gap-1 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full"
          >
            <Bot className="w-3 h-3" />
            Coach
          </Link>
          <Link
            href="/app/mobile/trophy"
            className="text-xs flex items-center gap-1 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full"
          >
            <Trophy className="w-3 h-3" />
            Trophies
          </Link>
          <Link
            href="/app/mobile/mission"
            className="text-xs flex items-center gap-1 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full"
          >
            <Flame className="w-3 h-3" />
            Mission
          </Link>
          <Link
            href="/app/mobile/today"
            className="text-xs flex items-center gap-1 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full"
          >
            <Sun className="w-3 h-3" />
            Today
          </Link>
        </div>
      </div>
      <ActiveQuestPin stats={stats} onUpdate={refetch} />

      {stats.meta?.dungeon && <DungeonBossBar dungeon={stats.meta.dungeon} />}
      {stats.meta?.dungeon && <DungeonWeaknessHint />}

      <ReadinessStrip
        initial={(stats.meta?.readiness as ReadinessEntry | null) ?? null}
        onLogged={refetch}
      />

      <StreakShieldPanel stats={stats} compact />

      <StreakCalendarMini />
      <BossRushPanel />

      <ProtocolStrip stats={stats} />

      {stats.dailyCompletion && (
        <motion.div className="glass rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-400/50 flex items-center justify-center glow-cyan">
              <span className="font-display font-bold text-cyan-300">
                {Math.round(
                  (stats.dailyCompletion.completed_habits /
                    Math.max(1, stats.dailyCompletion.total_habits)) *
                    100
                )}
                %
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-100">Daily Protocol</p>
              <p className="text-xs text-cyan-500/50">
                {stats.dailyCompletion.completed_habits} habits complete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <Zap className="w-4 h-4" />
            <span className="font-mono text-sm">
              +{stats.todayXpEarned ?? stats.dailyCompletion.total_xp}
            </span>
          </div>
        </motion.div>
      )}

      <QuantifiedRings habits={stats.habits} />
      <QuantifiedProgressPanel habits={stats.habits} onAdjust={incrementHabit} />

      <SupplementStack
        supplements={stats.supplements}
        onToggle={toggleSupplement}
        compact
      />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-xs uppercase tracking-[0.3em] text-cyan-500/50">
            Daily Quests
          </h3>
          <Flame className="w-4 h-4 text-orange-400" />
        </div>
        <QuestPanel quests={dailyQuests.slice(0, 3)} compact />
      </section>

      <section>
        <h3 className="font-display text-xs uppercase tracking-[0.3em] text-cyan-500/50 mb-3">
          Swipe to Complete — {incomplete.length} left
        </h3>
        <SwipeHabitList
          habits={incomplete}
          onComplete={(id) => completeHabit(id, true)}
          onSkip={(id) => {
            const h = stats.habits.find((x) => x.id === id);
            if (h) setSkipTarget({ id, name: h.name });
          }}
          onIncrement={incrementHabit}
          onCompleteCategory={completeCategory}
        />
      </section>

      <SkipHabitDialog
        habitName={skipTarget?.name ?? ""}
        open={!!skipTarget}
        onClose={() => setSkipTarget(null)}
        onConfirm={(reason) => {
          if (skipTarget) void skipHabit(skipTarget.id, reason);
          setSkipTarget(null);
        }}
        onSnooze={async () => {
          if (!skipTarget) return;
          await jarvisFetch("/api/habits/snooze", {
            method: "POST",
            body: JSON.stringify({ habitId: skipTarget.id }),
          });
          setSkipTarget(null);
          refetch();
        }}
      />
      <CompleteNextFab />
    </div>
    </PullToRefresh>
  );
}
