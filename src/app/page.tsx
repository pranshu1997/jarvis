"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { ParticleField } from "@/components/effects/ParticleField";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { GoogleSignIn } from "@/components/auth/GoogleSignIn";

const NEXUS_HUB = "http://127.0.0.1:3100";

export default function HomePage() {
  const router = useRouter();
  const [nexusOnly, setNexusOnly] = useState(false);
  const [nexusError, setNexusError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromNexus = params.get("from") === "nexus";
    const err = params.get("sso_error")?.trim() ?? "";
    if (fromNexus || err) {
      setNexusOnly(true);
      setNexusError(err || "Could not sign in from Nexus.");
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.localMode && !data.demo) {
          const params = new URLSearchParams(window.location.search);
          const from = params.get("from");
          if (from && from.startsWith("/app")) {
            router.replace(from);
          } else {
            router.replace("/app");
          }
        }
      })
      .catch(() => {});
  }, [router]);

  if (nexusOnly) {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden hud-grid px-6 py-12">
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold tracking-wide text-foreground">
            Forge
          </p>
          <p className="mt-6 text-sm text-destructive">
            Nexus sign-in failed: {nexusError}
          </p>
          <a
            href={NEXUS_HUB}
            className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            Back to Nexus
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden hud-grid px-6 py-12">
      <ParticleField count={40} />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-cyan-300">
            <Shield className="h-3 w-3" />
            Local Private System
          </div>
          <h1 className="font-display mt-6 text-4xl font-black tracking-tight text-cyan-100">
            JARVIS
          </h1>
          <p className="mt-2 text-sm text-cyan-100/50">
            Sign in to access your personal evolution RPG.
          </p>
        </div>

        <AuthScreen />
        <div className="mt-4">
          <GoogleSignIn />
        </div>
      </div>
    </div>
  );
}
