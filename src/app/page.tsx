"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ParticleField } from "@/components/effects/ParticleField";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/client";
import { Shield, Zap, User } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  const enterAsGuest = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("jarvis_guest", "true");
    }
    router.push("/app");
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      enterAsGuest();
      return;
    }
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden hud-grid">
      <ParticleField count={60} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6 max-w-2xl"
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs uppercase tracking-[0.3em] mb-8"
          animate={{ boxShadow: ["0 0 10px rgba(0,212,255,0.2)", "0 0 20px rgba(0,212,255,0.4)", "0 0 10px rgba(0,212,255,0.2)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Shield className="w-3 h-3" />
          Private Evolution System
        </motion.div>

        <h1 className="font-display text-6xl md:text-8xl font-black tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-cyan-400 to-blue-600 text-glow">
            JARVIS
          </span>
        </h1>

        <p className="mt-6 text-lg text-cyan-100/60 leading-relaxed">
          Level yourself up in real life. Physical. Mental. Awareness. Vitality.
          <br />
          <span className="text-cyan-400/80">You are evolving.</span>
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={signInWithGoogle} className="min-w-[200px]">
            <Zap className="w-4 h-4" />
            Awaken with Google
          </Button>
          <Button
            size="lg"
            variant="hologram"
            onClick={enterAsGuest}
            className="min-w-[200px]"
          >
            <User className="w-4 h-4" />
            Guest Mode
          </Button>
        </div>

        <p className="mt-8 text-xs text-cyan-500/40 font-mono">
          SOLO LEVELING × IRON MAN × CYBERPUNK
        </p>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none" />
    </div>
  );
}
