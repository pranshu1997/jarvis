export function hapticSuccess() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([10, 30, 10]);
  }
}

export function hapticLight() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(8);
  }
}

export function playSound(
  type: "complete" | "levelup" | "quest" | "category",
  enabled: boolean
) {
  if (!enabled || typeof window === "undefined") return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const frequencies: Record<string, number[]> = {
    complete: [440, 554],
    levelup: [523, 659, 784],
    quest: [392, 494, 587],
    category: [349, 440, 523, 659],
  };
  const freqs = frequencies[type] ?? frequencies.complete;
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = f;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.15);
    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.2);
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
