"use client";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function GoogleSignIn() {
  if (!isSupabaseConfigured()) return null;

  const signIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-cyan-500/20 text-cyan-100/80"
      onClick={() => void signIn()}
    >
      Continue with Google (Supabase)
    </Button>
  );
}
