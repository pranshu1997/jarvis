"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ParticleField } from "@/components/effects/ParticleField";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { GoogleSignIn } from "@/components/auth/GoogleSignIn";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [ssoError, setSsoError] = useState("");

  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("sso_error");
    if (err?.trim()) setSsoError(err.trim());
  }, []);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.localMode) {
          window.location.assign("/app");
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden hud-grid py-12">
      <ParticleField count={60} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full px-6 max-w-lg"
      >
        {ssoError ? (
          <p className="mb-4 text-center text-sm text-amber-300/90">
            Nexus sign-in: {ssoError}
          </p>
        ) : null}

        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs uppercase tracking-[0.3em] mb-6"
            animate={{
              boxShadow: [
                "0 0 10px rgba(0,212,255,0.2)",
                "0 0 20px rgba(0,212,255,0.4)",
                "0 0 10px rgba(0,212,255,0.2)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shield className="w-3 h-3" />
            Local Private System
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-cyan-400 to-blue-600 text-glow">
              JARVIS
            </span>
          </h1>
          <p className="mt-4 text-sm text-cyan-100/50">
            Create a profile · Login · Touch ID
          </p>
        </div>

        <AuthScreen />

        <div className="mt-4 space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full border-cyan-500/30"
            onClick={async () => {
              await fetch("/api/auth/demo", { method: "POST", credentials: "include" });
              sessionStorage.setItem("jarvis_session_active", "1");
              router.push("/app");
            }}
          >
            <Sparkles className="w-4 h-4" />
            Try Demo (no account)
          </Button>
          <GoogleSignIn />
        </div>
      </motion.div>
    </div>
  );
}
