"use client";

import { useEffect, useRef, useState } from "react";
import { Fingerprint, LogIn, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "login" | "register";

const TOUCH_ID_ATTEMPTED_KEY = "jarvis_touchid_attempted";

async function parseAuthResponse(res: Response): Promise<{
  ok: boolean;
  data: Record<string, unknown>;
}> {
  const text = await res.text();
  try {
    return { ok: res.ok, data: JSON.parse(text) as Record<string, unknown> };
  } catch {
    return {
      ok: false,
      data: {
        error: res.ok
          ? "Invalid server response"
          : `Request failed (${res.status}). Is Forge running?`,
      },
    };
  }
}

export function AuthScreen() {
  const touchAttempted = useRef(false);
  const [tab, setTab] = useState<Tab>("login");
  const [username, setUsername] = useState("pranshu");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [touchIdNote, setTouchIdNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDemoSession, setIsDemoSession] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.username === "demo") setIsDemoSession(true);
      })
      .catch(() => {});
  }, []);

  const exitDemo = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.assign("/login");
  };

  const finishLogin = () => {
    sessionStorage.removeItem(TOUCH_ID_ATTEMPTED_KEY);
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    if (from?.startsWith("/app")) {
      window.location.assign(from);
    } else {
      window.location.assign("/app");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(TOUCH_ID_ATTEMPTED_KEY) === "1") return;
    if (touchAttempted.current) return;
    touchAttempted.current = true;
    sessionStorage.setItem(TOUCH_ID_ATTEMPTED_KEY, "1");

    void fetch("/api/auth/touch-id", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "pranshu" }),
    })
      .then(async (res) => {
        const { ok, data } = await parseAuthResponse(res);
        if (ok) {
          finishLogin();
          return;
        }
        if (typeof data.error === "string") {
          setTouchIdNote(`Touch ID unavailable: ${data.error}`);
        }
      })
      .catch(() => {
        setTouchIdNote("Touch ID unavailable: could not reach Forge.");
      });
  }, []);

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
      const { ok, data } = await parseAuthResponse(res);
      if (!ok) throw new Error(String(data.error ?? "Login failed"));
      finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
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
      const { ok, data } = await parseAuthResponse(res);
      if (!ok) throw new Error(String(data.error ?? "Registration failed"));
      finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTouchId = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/touch-id", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim().toLowerCase() }),
      });
      const { ok, data } = await parseAuthResponse(res);
      if (!ok) throw new Error(String(data.error ?? "Touch ID login failed"));
      finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Touch ID login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {isDemoSession && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-amber-300">Demo mode active</p>
            <p className="text-xs text-amber-500/70 mt-0.5">
              You&apos;re exploring Forge in demo mode. Sign up to save your progress.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 flex-shrink-0"
            onClick={() => void exitDemo()}
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit demo
          </Button>
        </div>
      )}
      <div className="mb-6 flex rounded-xl border border-cyan-500/20 bg-slate-950/40 p-1">
        {(["login", "register"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setError("");
            }}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
              tab === t
                ? "bg-cyan-500/20 text-cyan-200"
                : "text-cyan-100/40 hover:text-cyan-100/70"
            )}
          >
            {t === "login" ? "Login" : "Create account"}
          </button>
        ))}
      </div>

      <form
        onSubmit={tab === "login" ? handleLogin : handleRegister}
        className="space-y-4 rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-6"
      >
        <div>
          <label className="text-xs uppercase tracking-wider text-cyan-500/50">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            autoComplete="username"
            className="mt-1 w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-3 text-cyan-50 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
            required
          />
        </div>

        {tab === "register" ? (
          <div>
            <label className="text-xs uppercase tracking-wider text-cyan-500/50">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-3 text-cyan-50 focus:border-cyan-400/50 focus:outline-none"
              placeholder="Optional"
            />
          </div>
        ) : null}

        <div>
          <label className="text-xs uppercase tracking-wider text-cyan-500/50">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={tab === "login" ? "current-password" : "new-password"}
            className="mt-1 w-full rounded-lg border border-cyan-500/20 bg-slate-900/80 px-4 py-3 text-cyan-50 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
            required
            minLength={tab === "login" ? 1 : 8}
          />
        </div>

        {touchIdNote ? (
          <p className="text-xs text-cyan-500/50">{touchIdNote}</p>
        ) : null}
        {error ? <p className="text-center text-sm text-red-400">{error}</p> : null}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {tab === "login" ? (
            <>
              <LogIn className="h-4 w-4" />
              {loading ? "Authenticating..." : "Login"}
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              {loading ? "Creating..." : "Create account"}
            </>
          )}
        </Button>

        {tab === "login" ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full border-cyan-500/30"
            disabled={loading || !username.trim()}
            onClick={handleTouchId}
          >
            <Fingerprint className="h-4 w-4" />
            Touch ID
          </Button>
        ) : null}
      </form>

      <p className="mt-4 text-center text-[10px] text-cyan-500/30 font-mono">
        Local-only · Session cookie · Profile: pranshu
      </p>
    </div>
  );
}
