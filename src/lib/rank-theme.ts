export type Rank =
  | "E"
  | "D"
  | "C"
  | "B"
  | "A"
  | "S"
  | "SS"
  | "SSS"
  | "National"
  | "Monarch";

export interface RankTheme {
  primary: string;
  secondary: string;
  glow: string;
  border: string;
  badge: string;
  accent: string;
  label: string;
}

export const RANK_THEMES: Record<string, RankTheme> = {
  E: {
    primary: "#6b7280",
    secondary: "#374151",
    glow: "rgba(107,114,128,0.3)",
    border: "rgba(107,114,128,0.3)",
    badge: "#6b7280",
    accent: "#9ca3af",
    label: "E-Rank",
  },
  D: {
    primary: "#78716c",
    secondary: "#44403c",
    glow: "rgba(120,113,108,0.3)",
    border: "rgba(120,113,108,0.3)",
    badge: "#78716c",
    accent: "#a8a29e",
    label: "D-Rank",
  },
  C: {
    primary: "#22c55e",
    secondary: "#14532d",
    glow: "rgba(34,197,94,0.3)",
    border: "rgba(34,197,94,0.3)",
    badge: "#22c55e",
    accent: "#4ade80",
    label: "C-Rank",
  },
  B: {
    primary: "#3b82f6",
    secondary: "#1e3a8a",
    glow: "rgba(59,130,246,0.3)",
    border: "rgba(59,130,246,0.3)",
    badge: "#3b82f6",
    accent: "#60a5fa",
    label: "B-Rank",
  },
  A: {
    primary: "#a855f7",
    secondary: "#4c1d95",
    glow: "rgba(168,85,247,0.4)",
    border: "rgba(168,85,247,0.4)",
    badge: "#a855f7",
    accent: "#c084fc",
    label: "A-Rank",
  },
  S: {
    primary: "#f59e0b",
    secondary: "#78350f",
    glow: "rgba(245,158,11,0.4)",
    border: "rgba(245,158,11,0.4)",
    badge: "#f59e0b",
    accent: "#fbbf24",
    label: "S-Rank",
  },
  SS: {
    primary: "#f97316",
    secondary: "#7c2d12",
    glow: "rgba(249,115,22,0.5)",
    border: "rgba(249,115,22,0.5)",
    badge: "#f97316",
    accent: "#fb923c",
    label: "SS-Rank",
  },
  SSS: {
    primary: "#ef4444",
    secondary: "#7f1d1d",
    glow: "rgba(239,68,68,0.5)",
    border: "rgba(239,68,68,0.5)",
    badge: "#ef4444",
    accent: "#f87171",
    label: "SSS-Rank",
  },
  National: {
    primary: "#00d4ff",
    secondary: "#0c4a6e",
    glow: "rgba(0,212,255,0.5)",
    border: "rgba(0,212,255,0.5)",
    badge: "#00d4ff",
    accent: "#67e8f9",
    label: "National",
  },
  Monarch: {
    primary: "#e879f9",
    secondary: "#4a044e",
    glow: "rgba(232,121,249,0.6)",
    border: "rgba(232,121,249,0.6)",
    badge: "#e879f9",
    accent: "#f0abfc",
    label: "Monarch",
  },
};

export function getRankTheme(rank: string): RankTheme {
  return RANK_THEMES[rank] ?? RANK_THEMES.E;
}

export function rankThemeToCssVars(theme: RankTheme): Record<string, string> {
  return {
    "--rank-primary": theme.primary,
    "--rank-secondary": theme.secondary,
    "--rank-glow": theme.glow,
    "--rank-border": theme.border,
    "--rank-badge": theme.badge,
    "--rank-accent": theme.accent,
  };
}
