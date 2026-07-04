import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getExtended, patchExtended } from "@/lib/player-settings-extended";

export async function POST() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { ran: false, message: "Not due" };
    await withGameState(async (state) => {
      const schedule = getExtended(state.profile).backup_schedule;
      if (!schedule?.enabled) {
        holder.message = "Backup schedule disabled";
        return;
      }
      const last = getExtended(state.profile).last_backup_run;
      const today = new Date().toISOString().slice(0, 10);
      if (last?.startsWith(today)) {
        holder.message = "Already backed up today";
        return;
      }
      patchExtended(state.profile, { last_backup_run: new Date().toISOString() });
      holder.ran = true;
      holder.message = `Backup marked complete (target: ${schedule.path ?? "~/Documents/Jarvis/"})`;
    });
    return NextResponse.json({ success: holder.ran, message: holder.message });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
