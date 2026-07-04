"use client";

import { useEffect, useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomHabitForm } from "@/components/features/CustomHabitForm";
import { Fingerprint, Download, Upload, Search } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useToastStore } from "@/stores/toast-store";
import { isSoundEnabled, setSoundEnabled } from "@/lib/feedback";
import { NotificationPrompt } from "@/components/features/NotificationPrompt";
import { HabitTargetsSettings } from "@/components/features/HabitTargetsSettings";
import { HealthSyncCard } from "@/components/features/HealthSyncCard";
import {
  XP_FORMULA_DEFAULTS,
  XP_FORMULA_LABELS,
  XP_FORMULA_RANGES,
  type XpFormulaConfig,
} from "@/lib/xp-config";
import { jarvisFetch } from "@/lib/api-client";
import { getExtended } from "@/lib/player-settings-extended";
import { setSoundTheme, type SoundTheme } from "@/lib/feedback";
import { SettingsTabs } from "@/components/features/SettingsTabs";
import { ArchivedHabitsPanel } from "@/components/features/ArchivedHabitsPanel";
import { SwipeReorderHabits } from "@/components/features/SwipeReorderHabits";
import { CoachSuggestHabits } from "@/components/features/CoachSuggestHabits";
import { CompactModeToggle } from "@/components/features/CompactModeToggle";
import { HabitReminderSettings } from "@/components/features/HabitReminderSettings";
import { MorningModeToggle } from "@/components/features/MorningModeToggle";
import { CalendarSubscribeButton } from "@/components/features/CalendarSubscribeButton";

export default function DesktopSettingsPage() {
  const { stats, refetch } = useDashboard();
  const [soundOn, setSoundOn] = useState(false);
  const [xpConfig, setXpConfig] = useState<XpFormulaConfig>(XP_FORMULA_DEFAULTS);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundTheme, setSoundThemeState] = useState<SoundTheme>("default");
  const [lightMode, setLightMode] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    if (stats) {
      const cfg = getExtended(stats.profile).xp_formula_config;
      if (cfg) setXpConfig({ ...XP_FORMULA_DEFAULTS, ...cfg });
      setReducedMotion(!!getExtended(stats.profile).reduced_motion);
      setSoundThemeState(getExtended(stats.profile).sound_theme ?? "default");
      setLightMode(getExtended(stats.profile).theme_mode === "light");
      setWebhookUrl(getExtended(stats.profile).webhook_url ?? "");
    }
  }, [stats]);
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

  const autoBackup = async () => {
    const res = await jarvisFetch("/api/backup/auto", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      useToastStore.getState().show(data.error ?? "Backup failed", "error");
      return;
    }
    useToastStore.getState().show("Backup saved to data/backups/", "success");
  };

  const saveXpConfig = async () => {
    await jarvisFetch("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify({ xpFormulaConfig: xpConfig }),
    });
    useToastStore.getState().show("XP formula saved", "success");
    refetch();
  };

  const addCategory = async () => {
    if (!catName.trim() || !catSlug.trim()) return;
    const res = await jarvisFetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: catName, slug: catSlug }),
    });
    if (!res.ok) {
      const data = await res.json();
      useToastStore.getState().show(data.error ?? "Failed", "error");
      return;
    }
    useToastStore.getState().show("Category created", "success");
    setCatName("");
    setCatSlug("");
    refetch();
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

  const [settingsSearch, setSettingsSearch] = useState("");

  return (
    <div className="p-8 space-y-8 max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-bold text-cyan-100">Settings</h1>
        <p className="text-cyan-500/50 mt-1">Configure your evolution system</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/40" />
        <input
          value={settingsSearch}
          onChange={(e) => setSettingsSearch(e.target.value)}
          placeholder="Search settings…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cyan-500/20 bg-slate-900/80 text-cyan-50 placeholder:text-cyan-500/40 focus:outline-none focus:border-cyan-400/50 text-sm"
        />
      </div>

      <HealthSyncCard onSynced={refetch} />

      <Card glow>
        <CardHeader>
          <CardTitle>XP Formula Sliders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(XP_FORMULA_DEFAULTS) as (keyof XpFormulaConfig)[]).map((key) => {
            const range = XP_FORMULA_RANGES[key];
            return (
              <label key={key} className="block text-sm text-cyan-100/80">
                {XP_FORMULA_LABELS[key]}: {xpConfig[key].toFixed(2)}
                <input
                  type="range"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={xpConfig[key]}
                  onChange={(e) =>
                    setXpConfig({ ...xpConfig, [key]: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-400"
                />
              </label>
            );
          })}
          <Button variant="hologram" size="sm" onClick={() => void saveXpConfig()}>
            Save XP formula
          </Button>
        </CardContent>
      </Card>

      <Card glow>
        <CardHeader>
          <CardTitle>Custom Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <input placeholder="Name" value={catName} onChange={(e) => setCatName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50" />
          <input placeholder="slug" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50" />
          <Button variant="hologram" onClick={() => void addCategory()}>Add category</Button>
        </CardContent>
      </Card>

      <Card glow>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={async (e) => {
                setReducedMotion(e.target.checked);
                await jarvisFetch("/api/profile/settings", {
                  method: "PATCH",
                  body: JSON.stringify({ reducedMotion: e.target.checked }),
                });
                document.documentElement.classList.toggle("motion-reduce", e.target.checked);
              }}
              className="accent-cyan-400"
            />
            <span className="text-cyan-100/80">Reduce motion</span>
          </label>
        </CardContent>
      </Card>

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
          <Button variant="outline" className="w-full" onClick={() => void autoBackup()}>
            Auto-backup to data/backups/
          </Button>
          <a href="/api/reports/weekly" className="block text-center text-xs text-cyan-400 hover:underline">
            Download weekly report (Markdown)
          </a>
          <a href="/api/calendar/feed" className="block text-center text-xs text-cyan-400 hover:underline">
            Download weekly review calendar (.ics)
          </a>
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

      <SettingsTabs
        sections={[
          {
            tab: "game",
            title: "Sound & Theme",
            children: (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(["default", "arcade", "minimal", "solo"] as SoundTheme[]).map((t) => (
                    <Button
                      key={t}
                      size="sm"
                      variant={soundTheme === t ? "default" : "outline"}
                      onClick={async () => {
                        setSoundTheme(t);
                        setSoundThemeState(t);
                        await jarvisFetch("/api/profile/settings", {
                          method: "PATCH",
                          body: JSON.stringify({ sound_theme: t }),
                        });
                      }}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm text-cyan-200">
                  <input
                    type="checkbox"
                    checked={lightMode}
                    onChange={async (e) => {
                      setLightMode(e.target.checked);
                      document.documentElement.classList.toggle("light-mode", e.target.checked);
                      await jarvisFetch("/api/profile/settings", {
                        method: "PATCH",
                        body: JSON.stringify({ theme_mode: e.target.checked ? "light" : "dark" }),
                      });
                    }}
                  />
                  Light mode
                </label>
                <CompactModeToggle />
                <MorningModeToggle />
                <div className="pt-2 border-t border-cyan-500/10">
                  <HabitReminderSettings />
                </div>
                <div className="pt-2">
                  <CalendarSubscribeButton />
                </div>
              </div>
            ),
          },
          {
            tab: "system",
            title: "Webhooks & Backup",
            children: (
              <div className="space-y-3">
                <input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="Webhook URL (Zapier/Shortcuts)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await jarvisFetch("/api/webhooks", {
                      method: "POST",
                      body: JSON.stringify({ webhook_url: webhookUrl }),
                    });
                    useToastStore.getState().show("Webhook saved", "success");
                  }}
                >
                  Save webhook
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const res = await jarvisFetch("/api/webhooks", {
                      method: "POST",
                      body: JSON.stringify({ test: true }),
                    });
                    const d = await res.json();
                    useToastStore.getState().show(d.message ?? "Test sent", res.ok ? "success" : "error");
                  }}
                >
                  Test webhook
                </Button>
                <Button size="sm" variant="outline" onClick={() => void jarvisFetch("/api/demo/migrate", { method: "POST" })}>
                  Migrate demo progress
                </Button>
              </div>
            ),
          },
          {
            tab: "body",
            title: "Habits",
            children: (
              <div className="space-y-6">
                <SwipeReorderHabits />
                <ArchivedHabitsPanel />
                <CoachSuggestHabits />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
