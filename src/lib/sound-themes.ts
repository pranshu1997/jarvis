export type SoundTheme = "default" | "arcade" | "minimal" | "solo";

export function getSoundTheme(): SoundTheme {
  if (typeof window === "undefined") return "default";
  const stored = localStorage.getItem("jarvis_sound_theme");
  if (stored === "arcade" || stored === "minimal" || stored === "solo") return stored;
  return "default";
}

export function setSoundTheme(theme: SoundTheme): void {
  localStorage.setItem("jarvis_sound_theme", theme);
}

/** Frequency sets per theme for complete action */
export function themeCompleteFreqs(theme: SoundTheme): number[] {
  switch (theme) {
    case "arcade":
      return [523, 659, 784, 1047];
    case "minimal":
      return [440];
    case "solo":
      return [392, 523, 659, 784, 988, 1175];
    default:
      return [440, 554];
  }
}

export function themeLevelUpFreqs(theme: SoundTheme): number[] {
  switch (theme) {
    case "arcade":
      return [392, 494, 587, 698, 784, 988, 1175];
    case "minimal":
      return [523, 659];
    case "solo":
      return [262, 330, 392, 523, 659, 784, 988, 1319];
    default:
      return [523, 659, 784, 1047];
  }
}

export function themeVolume(theme: SoundTheme, base: number): number {
  switch (theme) {
    case "arcade":
      return base * 1.2;
    case "minimal":
      return base * 0.5;
    case "solo":
      return base * 1.1;
    default:
      return base;
  }
}

export function themeOscType(theme: SoundTheme): OscillatorType {
  if (theme === "arcade") return "square";
  if (theme === "solo") return "triangle";
  return "sine";
}
