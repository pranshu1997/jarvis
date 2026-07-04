"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { jarvisFetch } from "@/lib/api-client";
import { Bot, Send } from "lucide-react";

interface Message {
  role: "user" | "coach";
  text: string;
  source?: string;
}

export function CoachChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "coach",
      text: "Systems online. Ask me about streaks, weak categories, or today's priorities.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);

    const res = await jarvisFetch("/api/coach", {
      method: "POST",
      body: JSON.stringify({ question: q }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessages((m) => [...m, { role: "coach", text: data.error ?? "Could not reach coach." }]);
      return;
    }
    setMessages((m) => [
      ...m,
      { role: "coach", text: data.answer, source: data.source },
    ]);
  };

  const suggestions = [
    "What should I focus on today?",
    "Why is Physical stalling?",
    "How are my streaks?",
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-[50vh] overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-cyan-500/20 text-cyan-100 border border-cyan-500/30"
                  : "glass border border-cyan-500/20 text-cyan-100/90"
              }`}
            >
              {m.role === "coach" && (
                <Bot className="w-4 h-4 text-cyan-400 mb-1" />
              )}
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.source && (
                <p className="text-[9px] text-cyan-500/40 mt-1 uppercase">{m.source}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <p className="text-xs text-cyan-500/50 animate-pulse">Analyzing protocol…</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setInput(s)}
            className="text-[10px] px-2 py-1 rounded-full border border-cyan-500/20 text-cyan-500/60 hover:text-cyan-300"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void ask()}
          placeholder="Ask JARVIS…"
          className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-sm text-cyan-50"
        />
        <Button variant="hologram" size="icon" onClick={() => void ask()} disabled={loading}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CoachPageContent() {
  return (
    <div className="space-y-6 pt-4 md:pt-0 md:p-8 md:max-w-2xl">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-cyan-100">
          JARVIS Coach
        </h1>
        <p className="text-cyan-500/50 mt-1 text-sm">
          AI advisor · local-first · set ANTHROPIC_API_KEY for Claude
        </p>
      </header>
      <Card glow>
        <CardContent className="pt-6">
          <CoachChat />
        </CardContent>
      </Card>
    </div>
  );
}
