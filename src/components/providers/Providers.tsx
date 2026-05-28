"use client";

import { LevelUpOverlay } from "@/components/effects/LevelUpOverlay";
import { XpFloatLayer } from "@/components/effects/XpFloatLayer";
import { ToastLayer } from "@/components/ui/ToastLayer";
import { DebriefModal } from "@/components/features/DebriefModal";
import { MissionBriefModal } from "@/components/features/MissionBriefModal";
import { CommandPalette } from "@/components/features/CommandPalette";
import { PwaInstallPrompt } from "@/components/features/PwaInstallPrompt";
import { RankUpOverlay } from "@/components/effects/RankUpOverlay";
import { UndoBar } from "@/components/features/UndoBar";
import { ReminderScheduler } from "@/components/features/ReminderScheduler";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <XpFloatLayer />
      <LevelUpOverlay />
      <RankUpOverlay />
      <ToastLayer />
      <DebriefModal />
      <MissionBriefModal />
      <CommandPalette />
      <PwaInstallPrompt />
      <UndoBar />
      <ReminderScheduler />
    </>
  );
}
