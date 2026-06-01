"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { Button } from "@/components/ui/button";
import { Fingerprint, LogIn, UserPlus } from "lucide-react";
import { LAST_USERNAME_KEY } from "@/components/auth/SessionGuard";

type Tab = "login" | "register";

export function AuthScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LAST_USERNAME_KEY);
    if (saved) setUsername(saved);

    if (typeof window === "undefined" || !window.PublicKeyCredential) return;
    void PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.().then(
      (available) => setBiometricAvailable(!!available)
    );
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("jarvis_touchid_attempted") === "1") return;
    sessionStorage.setItem("jarvis_touchid_attempted", "1");

    void fetch("/api/auth/touch-id", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "pranshu" }),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data.user) persistLogin(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!username.trim() || tab !== "login") {
      setHasBiometric(false);
      return;
    }
    setHasBiometric(
      localStorage.getItem(`jarvis_biometric_${username.trim().toLowerCase()}`) ===
        "1"
    );
  }, [username, tab]);

  const markBiometricEnabled = (u: string) => {
    localStorage.setItem(`jarvis_biometric_${u.trim().toLowerCase()}`, "1");
    setHasBiometric(true);
  };

  const persistLogin = (user: { username?: string }) => {
    sessionStorage.setItem("jarvis_session_active", "1");
    if (user.username) {
      localStorage.setItem(LAST_USERNAME_KEY, user.username);
    }
    window.location.assign("/app");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          displayName: displayName || username,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");

      if (biometricAvailable && window.confirm(
        "Enable Touch ID / Face ID for faster login next time?"
      )) {
        await enableBiometric();
      }

      persistLogin(data.user ?? { username });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");

      persistLogin(data.user ?? { username });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const enableBiometric = async () => {
    const optRes = await fetch("/api/auth/webauthn/register-options", {
      method: "POST",
      credentials: "include",
    });
    const options = await optRes.json();
    if (!optRes.ok) throw new Error(options.error);

    const attestation = await startRegistration({ optionsJSON: options });
    const verifyRes = await fetch("/api/auth/webauthn/register-verify", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attestation),
    });
    const data = await verifyRes.json();
    if (!verifyRes.ok) throw new Error(data.error ?? "Biometric setup failed");
    markBiometricEnabled(username);
  };

  const handleBiometricLogin = async () => {
    if (!username.trim()) {
      setError("Enter your username first — Touch ID is tied to your profile");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const optRes = await fetch("/api/auth/webauthn/login-options", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim().toLowerCase() }),
      });
      const options = await optRes.json();
      if (!optRes.ok) {
        throw new Error(
          options.error ??
            "No Touch ID on this profile — log in with password, then enable it in Settings"
        );
      }

      const assertion = await startAuthentication({ optionsJSON: options });
      const verifyRes = await fetch("/api/auth/webauthn/login-verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          credential: assertion,
        }),
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(data.error ?? "Biometric login failed");

      markBiometricEnabled(username);
      persistLogin(data.user ?? { username });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Biometric login failed";
      setError(
        msg.includes("NotAllowed")
          ? "Touch ID cancelled or timed out — try again"
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex rounded-xl border border-cyan-500/20 p-1 mb-6">
        {(["login", "register"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setError("");
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t
                ? "bg-cyan-500/20 text-cyan-200"
                : "text-cyan-100/40 hover:text-cyan-100/70"
            }`}
          >
            {t === "login" ? "Login" : "New Profile"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.form
          key={tab}
          initial={{ opacity: 0, x: tab === "login" ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          onSubmit={tab === "login" ? handleLogin : handleRegister}
          className="space-y-4 glass rounded-2xl p-6"
        >
          <div>
            <label className="text-xs text-cyan-500/50 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              autoComplete="username"
              className="mt-1 w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-cyan-500/20 text-cyan-50 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
              placeholder="hunter"
              required
            />
          </div>

          {tab === "register" && (
            <div>
              <label className="text-xs text-cyan-500/50 uppercase tracking-wider">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-cyan-500/20 text-cyan-50 focus:border-cyan-400/50 focus:outline-none"
                placeholder="Hunter"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-cyan-500/50 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === "login" ? "current-password" : "new-password"}
              className="mt-1 w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-cyan-500/20 text-cyan-50 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {tab === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                {loading ? "Authenticating..." : "Enter System"}
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                {loading ? "Creating..." : "Create Profile"}
              </>
            )}
          </Button>

          {tab === "login" && biometricAvailable && (
            <>
              <Button
                type="button"
                variant="hologram"
                size="lg"
                className="w-full"
                disabled={loading || !username.trim()}
                onClick={handleBiometricLogin}
              >
                <Fingerprint className="w-4 h-4" />
                Touch ID / Face ID
              </Button>
              <p className="text-[10px] text-cyan-500/40 text-center leading-relaxed">
                {hasBiometric
                  ? "Uses a passkey stored on this device for your username. Same URL as setup (use localhost, not 127.0.0.1)."
                  : "Set up in Settings after your first password login, or accept the prompt when registering."}
              </p>
            </>
          )}
        </motion.form>
      </AnimatePresence>

      <p className="text-center text-[10px] text-cyan-500/30 mt-4 font-mono">
        Local-only · Session cookie · Survives dev server restarts
      </p>
    </div>
  );
}
