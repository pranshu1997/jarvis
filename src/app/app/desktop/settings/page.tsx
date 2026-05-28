"use client";

import { useEffect, useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomHabitForm } from "@/components/features/CustomHabitForm";
import { Fingerprint, Download, Upload } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useToastStore } from "@/stores/toast-store";
import { isSoundEnabled, setSoundEnabled } from "@/lib/feedback";
import { NotificationPrompt } from "@/components/features/NotificationPrompt";
import { HabitTargetsSettings } from "@/components/features/HabitTargetsSettings";

export default function DesktopSettingsPage() {
  const { stats, refetch } = useDashboard();
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);
  const [bioMessage, setBioMessage] = useState("");
  const [questForm, setQuestForm] = useState({
    title: "",
    questType: "side",
    xpReward: 50,
    targetCount: 1,
  });

  const enableBiometric = async () => {
    setBioMessage("");
    try {
      const optRes = await fetch("/api/auth/webauthn/register-options", { method: "POST" });
      const options = await optRes.json();
      if (!optRes.ok) throw new Error(options.error);
      const attestation = await startRegistration({ optionsJSON: options });
      const verifyRes = await fetch("/api/auth/webauthn/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attestation),
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(data.error);
      setBioMessage("Touch ID / Face ID enabled");
      const sessionRes = await fetch("/api/auth/session", { credentials: "include" });
      const session = await sessionRes.json();
      if (session.user?.username) {
        localStorage.setItem(`jarvis_biometric_${session.user.username}`, "1");
      }
    } catch (e) {
      setBioMessage(e instanceof Error ? e.message : "Failed");
    }
  };

  const addQuest = async () => {
    if (!questForm.title.trim()) return;
    const res = await fetch("/api/quests/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questForm),
    });
    const data = await res.json();
    if (!res.ok) {
      useToastStore.getState().show(data.error ?? "Failed", "error");
      return;
    }
    useToastStore.getState().show(`Quest created`, "success");
    setQuestForm({ title: "", questType: "side", xpReward: 50, targetCount: 1 });
    refetch();
  };

  const exportBackup = () => {
    window.open("/api/backup/export", "_blank");
  };

  const importBackup = async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text);
    const res = await fetch("/api/backup/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      useToastStore.getState().show("Import failed", "error");
      return;
    }
    useToastStore.getState().show("Backup restored", "success");
    refetch();
  };

  return (
    <div className="p-8 space-y-8 max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-bold text-cyan-100">Settings</h1>
        <p className="text-cyan-500/50 mt-1">Configure your evolution system</p>
      </header>

      <Card glow>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <NotificationPrompt />
          <p className="text-xs text-cyan-500/50">
            Evening reminder at 6pm when habits are incomplete (browser permission
            required).
          </p>
        </CardContent>
      </Card>

      <Card glow>
        <CardHeader>
          <CardTitle>Daily targets</CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <HabitTargetsSettings stats={stats} onUpdated={refetch} />
          ) : (
            <p className="text-sm text-cyan-500/50">Loading…</p>
          )}
        </CardContent>
      </Card>

      <Card glow>
        <CardHeader>
          <CardTitle>Sound Effects</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={soundOn}
              onChange={(e) => {
                setSoundOn(e.target.checked);
                setSoundEnabled(e.target.checked);
              }}
              className="accent-cyan-400"
            />
            <span className="text-cyan-100/80">UI sounds on complete / level up</span>
          </label>
        </CardContent>
      </Card>

      <Card glow>
        <CardHeader>
          <CardTitle>Add Custom Habit</CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <CustomHabitForm habits={stats.habits} onCreated={() => refetch()} />
          ) : (
            <p className="text-sm text-cyan-500/50">Loading…</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Custom Quest</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            placeholder="Quest title"
            value={questForm.title}
            onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50"
          />
          <Button variant="hologram" className="w-full" onClick={addQuest}>
            + Create Quest
          </Button>
        </CardContent>
      </Card>

      <Card glow>
        <CardHeader>
          <CardTitle>Biometric Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="hologram" onClick={enableBiometric}>
            <Fingerprint className="w-4 h-4" />
            Enable Touch ID / Face ID
          </Button>
          {bioMessage && <p className="text-sm text-cyan-400">{bioMessage}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Local Backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="hologram" className="w-full" onClick={exportBackup}>
            <Download className="w-4 h-4" />
            Export JSON Backup
          </Button>
          <label className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-cyan-500/30 text-cyan-100 cursor-pointer hover:bg-cyan-500/10">
            <Upload className="w-4 h-4" />
            Import Backup
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importBackup(f);
              }}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Habit XP Formula</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-cyan-100/60 font-mono space-y-1">
          <p>base_xp = round(baseline_habit_xp × toughness)</p>
          <p>Default baseline: Meditate (15 XP) at 1.0×</p>
          <p>Category XP = earned + 12% × sum(habit base XP in category)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Streak Multipliers</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-cyan-100/60 font-mono space-y-1">
          <p>3+ days: 1.5× · 7+ days: 1.75× · 14+ days: 2.0× · 30+ days: 2.5×</p>
          <p>Perfect day: 1.5× · Perfect week (5+ days): 1.35× · Category complete: 1.25×</p>
        </CardContent>
      </Card>
    </div>
  );
}
