"use client";

import { LevelUpOverlay } from "@/components/effects/LevelUpOverlay";
import { XpFloatLayer } from "@/components/effects/XpFloatLayer";
import { ToastLayer } from "@/components/ui/ToastLayer";
import { DebriefModal } from "@/components/features/DebriefModal";
import { MissionBriefModal } from "@/components/features/MissionBriefModal";
import { CommandPalette } from "@/components/features/CommandPalette";
import { PwaInstallPrompt } from "@/components/features/PwaInstallPrompt";
import { RankUpOverlay } from "@/components/effects/RankUpOverlay";
import { RankUpCinematic } from "@/components/effects/RankUpCinematic";
import { UndoBar } from "@/components/features/UndoBar";
import { ReminderScheduler } from "@/components/features/ReminderScheduler";
import { PhoenixCeremony } from "@/components/effects/PhoenixCeremony";
import { PerfectWeekOverlay } from "@/components/effects/PerfectWeekOverlay";
import { PRCelebration } from "@/components/effects/PRCelebration";
import { OnboardingWizard } from "@/components/features/OnboardingWizard";
import { MorningEntryGate } from "@/components/features/MorningEntryGate";
import { FocusModeProvider } from "@/contexts/FocusModeContext";
import { RankThemeProvider } from "@/components/providers/RankThemeProvider";
import { CosmeticApplier } from "@/components/providers/CosmeticApplier";
import { SeasonalEventBanner } from "@/components/features/SeasonalEventBanner";
import { ProactiveNudgeBanner } from "@/components/features/ProactiveNudgeBanner";
import { ComboTrail } from "@/components/features/ComboTrail";
import { CoinEarnToast } from "@/components/features/CoinEarnToast";
import { KeyboardCheatSheet } from "@/components/features/KeyboardCheatSheet";
import { QuestExpiryBanner } from "@/components/features/QuestExpiryBanner";
import { DoubleXpBanner } from "@/components/features/DoubleXpBanner";
import { SundayCoachBrief } from "@/components/features/SundayCoachBrief";
import { ParticleBoostOverlay } from "@/components/features/ParticleBoostOverlay";
import { LevelUpVoiceLine } from "@/components/effects/LevelUpVoiceLine";
import { TabletLayoutWrapper } from "@/components/providers/TabletLayoutWrapper";
import { StreakMilestoneToast } from "@/components/features/StreakMilestoneToast";
import { QuestExpiryNotifier } from "@/components/features/QuestExpiryNotifier";
import { FocusPomodoroOverlay } from "@/components/features/FocusPomodoroOverlay";
import { NotificationPermissionNudge } from "@/components/features/NotificationPermissionNudge";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FocusModeProvider>
      <RankThemeProvider>
        <CosmeticApplier />
        <TabletLayoutWrapper>
          <MorningEntryGate>
            <SeasonalEventBanner />
            <ProactiveNudgeBanner />
            <DoubleXpBanner />
            <QuestExpiryBanner />
            <NotificationPermissionNudge />
            {children}
          </MorningEntryGate>
        </TabletLayoutWrapper>
        <XpFloatLayer />
        <LevelUpOverlay />
        <RankUpOverlay />
        <RankUpCinematic />
        <PRCelebration />
        <PhoenixCeremony />
        <PerfectWeekOverlay />
        <ComboTrail />
        <CoinEarnToast />
        <StreakMilestoneToast />
        <QuestExpiryNotifier />
        <FocusPomodoroOverlay />
        <ParticleBoostOverlay />
        <LevelUpVoiceLine />
        <SundayCoachBrief />
        <ToastLayer />
        <DebriefModal />
        <MissionBriefModal />
        <CommandPalette />
        <KeyboardCheatSheet />
        <PwaInstallPrompt />
        <UndoBar />
        <ReminderScheduler />
        <OnboardingWizard />
      </RankThemeProvider>
    </FocusModeProvider>
  );
}
