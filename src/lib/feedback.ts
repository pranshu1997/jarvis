import {
  getSoundTheme,
  themeCompleteFreqs,
  themeLevelUpFreqs,
  themeVolume,
  themeOscType,
  type SoundTheme,
} from "@/lib/sound-themes";

export { getSoundTheme, setSoundTheme, type SoundTheme } from "@/lib/sound-themes";

type SoundType =
  | "complete"
  | "levelup"
  | "quest"
  | "category"
  | "rankup"
  | "dungeon"
  | "perfect_day"
  | "shop";

export function playSound(type: SoundType, enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const theme = getSoundTheme();

  switch (type) {
    case "complete":
      playTone(ctx, themeCompleteFreqs(theme), {
        duration: theme === "minimal" ? 0.08 : 0.15,
        gap: theme === "arcade" ? 0.06 : 0.08,
        volume: themeVolume(theme, 0.08),
        type: themeOscType(theme),
      });
      break;
    case "levelup":
      playTone(ctx, themeLevelUpFreqs(theme), {
        duration: 0.18,
        gap: 0.1,
        volume: themeVolume(theme, 0.1),
        type: themeOscType(theme),
      });
      break;
    case "quest":
      playTone(ctx, [392, 494, 587], { duration: 0.16, gap: 0.09, volume: 0.09 });
      break;
    case "category":
      playTone(ctx, [349, 440, 523, 659], { duration: 0.15, gap: 0.08, volume: 0.09 });
      break;
    case "rankup":
      playRankUp(ctx);
      break;
    case "dungeon":
      playDungeon(ctx);
      break;
    case "perfect_day":
      playPerfectDay(ctx);
      break;
    case "shop":
      playShop(ctx);
      break;
  }
}

interface ToneOptions {
  duration: number;
  gap: number;
  volume: number;
  type?: OscillatorType;
}

function playTone(
  ctx: AudioContext,
  freqs: number[],
  { duration, gap, volume, type = "sine" }: ToneOptions
) {
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = f;
    osc.type = type;
    const t = ctx.currentTime + i * gap;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  });
}

function playRankUp(ctx: AudioContext) {
  const freqs = [392, 523, 659, 784, 1047, 1319];
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = f;
    osc.type = "triangle";
    const t = ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.start(t);
    osc.stop(t + 0.3);
  });
  const finalOsc = ctx.createOscillator();
  const finalGain = ctx.createGain();
  finalOsc.connect(finalGain);
  finalGain.connect(ctx.destination);
  finalOsc.frequency.value = 1760;
  finalOsc.type = "sine";
  const tFinal = ctx.currentTime + 0.78;
  finalGain.gain.setValueAtTime(0.15, tFinal);
  finalGain.gain.exponentialRampToValueAtTime(0.001, tFinal + 0.5);
  finalOsc.start(tFinal);
  finalOsc.stop(tFinal + 0.55);
}

function playDungeon(ctx: AudioContext) {
  [110, 87, 98].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = f;
    osc.type = "sawtooth";
    const t = ctx.currentTime + i * 0.15;
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.35);
  });
}

function playPerfectDay(ctx: AudioContext) {
  const chord = [523, 659, 784, 1047];
  chord.forEach((f) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = f;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.25);
  });
  [1047, 1319, 1568].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = f;
    osc.type = "triangle";
    const t = ctx.currentTime + 0.4 + i * 0.15;
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.25);
  });
}

function playShop(ctx: AudioContext) {
  [698, 880, 1047].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = f;
    osc.type = "sine";
    const t = ctx.currentTime + i * 0.07;
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.start(t);
    osc.stop(t + 0.15);
  });
}

let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    return audioCtx;
  } catch {
    return null;
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("jarvis_sound") !== "false";
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem("jarvis_sound", enabled ? "true" : "false");
}

export {
  hapticLight,
  hapticSuccess,
  hapticCombo,
  hapticRankUp,
  hapticDungeonHit,
  hapticPerfectDay,
  hapticShopPurchase,
} from "@/lib/haptics";
