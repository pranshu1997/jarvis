import { getDemoDashboard } from "@/lib/demo-data";
import { bootstrapGameState } from "@/lib/local/bootstrap";
import type { DashboardStats } from "@/types/database";

const globalStore = globalThis as typeof globalThis & {
  __jarvisDemoState?: DashboardStats;
};

export function getDemoModeState(): DashboardStats {
  if (!globalStore.__jarvisDemoState) {
    globalStore.__jarvisDemoState = getDemoDashboard();
    bootstrapGameState(globalStore.__jarvisDemoState, "demo-user");
  }
  return globalStore.__jarvisDemoState;
}

export function resetDemoModeState(): void {
  globalStore.__jarvisDemoState = undefined;
}
