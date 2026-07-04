import { getExtended } from "@/lib/player-settings-extended";
import type { Profile } from "@/types/database";

const THEME_CLASSES: Record<string, string[]> = {
  "hud-crimson": ["theme-hud-crimson"],
  "hud-emerald": ["theme-hud-emerald"],
  "hud-gold": ["theme-hud-gold"],
  "hud-void": ["theme-hud-void"],
  "particles-boost": ["theme-particles-boost"],
};

export function applyHudTheme(profile: Profile): void {
  if (typeof document === "undefined") return;
  const ext = getExtended(profile);
  const root = document.documentElement;

  for (const classes of Object.values(THEME_CLASSES)) {
    for (const cls of classes) root.classList.remove(cls);
  }

  const theme = ext.hud_theme ?? "default";
  const owned = ext.cosmetics_owned ?? [];

  if (theme !== "default" && (owned.includes(theme) || theme.startsWith("rank-"))) {
    for (const cls of THEME_CLASSES[theme] ?? [`theme-${theme}`]) {
      root.classList.add(cls);
    }
  }

  if (owned.includes("particles-boost")) {
    root.classList.add("theme-particles-boost");
  }

  const mode = ext.theme_mode ?? "dark";
  root.classList.toggle("light-mode", mode === "light");
}
