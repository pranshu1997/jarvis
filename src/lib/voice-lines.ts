export const LEVEL_UP_QUOTES = [
  "The system acknowledges your growth.",
  "Another step toward Monarch-tier.",
  "Your stats don't lie — keep pushing.",
  "The gate opens wider with each level.",
  "Shadows grow stronger around you.",
  "Discipline compounds. Level secured.",
  "The hunter evolves. The prey trembles.",
];

export const RANK_UP_QUOTES: Record<string, string> = {
  D: "Novice clearance granted. The real training begins.",
  C: "Competent hunter status achieved.",
  B: "Veteran rank — the system takes notice.",
  A: "Elite tier unlocked. Few reach this far.",
  S: "S-Rank. You stand among the apex.",
  MONARCH: "Monarch. There is no rank above you.",
};

export function randomLevelQuote(): string {
  return LEVEL_UP_QUOTES[Math.floor(Math.random() * LEVEL_UP_QUOTES.length)]!;
}

export function rankQuote(rank: string): string {
  return RANK_UP_QUOTES[rank] ?? "Your power grows.";
}
