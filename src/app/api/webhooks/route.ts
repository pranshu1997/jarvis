import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getExtended, patchExtended } from "@/lib/player-settings-extended";
import { fireWebhook } from "@/lib/webhooks";

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const holder = { url: "" };
    await withGameState((state) => {
      holder.url = getExtended(state.profile).webhook_url ?? "";
    });
    return NextResponse.json({ webhook_url: holder.url });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as { webhook_url?: string; test?: boolean };
  const isTest = body.test === true;

  try {
    if (isTest) {
      let fired = false;
      await withGameState(async (state) => {
        fired = await fireWebhook("level_up", { test: true, message: "Forge webhook test" }, state.profile);
      });
      return NextResponse.json({ success: fired, message: fired ? "Webhook delivered" : "Webhook failed or not configured" });
    }

    await withGameState((state) => {
      patchExtended(state.profile, { webhook_url: body.webhook_url ?? "" });
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
