/** Double XP weekends: Sat–Sun */
export function isDoubleXpActive(date = new Date()): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function getDoubleXpMultiplier(date = new Date()): number {
  return isDoubleXpActive(date) ? 2 : 1;
}

export function doubleXpLabel(): string {
  return "Double XP Weekend — all habit & quest XP ×2";
}
