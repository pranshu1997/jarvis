import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { buildDossierReport } from "@/lib/reports-monthly";

export async function GET() {
  if (!isLocalAuthMode()) return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  try {
    const holder = { html: "" };
    await withGameState((state) => {
      const md = buildDossierReport(state);
      holder.html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Forge Dossier</title>
        <style>body{font-family:system-ui;max-width:720px;margin:2rem auto;padding:1rem;background:#0c1929;color:#a5f3fc;line-height:1.6}
        h1,h2{color:#22d3ee}pre{white-space:pre-wrap;font-family:inherit}</style></head>
        <body><pre>${md.replace(/</g, "&lt;")}</pre><script>window.onload=()=>window.print()</script></body></html>`;
    });
    return new NextResponse(holder.html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch (e) {
    if (e instanceof GameAuthError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}
