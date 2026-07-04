"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { CoachQuickPrompts } from "@/components/features/CoachQuickPrompts";
import { jarvisFetch } from "@/lib/api-client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  usedAi?: boolean;
  timestamp: number;
}

const SUGGESTED_QUESTIONS = [
  "Why is my Physical category stalling?",
  "How can I maximize XP this week?",
  "What should my next quest focus on?",
  "How do I maintain my streak?",
  "What's my weakest area?",
  "Am I ready for a hard training day?",
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "JARVIS Coach online. I have access to your real-time stats — streaks, XP, categories, readiness, and more. Ask me anything about your performance or strategy.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (question: string) => {
    const q = question.trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: q,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await jarvisFetch("/api/coach", {
        method: "POST",
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json() as { answer?: string; usedAi?: boolean; error?: string };

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.answer ?? data.error ?? "Unable to get a response.",
        usedAi: data.usedAi,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Network error. Make sure the app is running and try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const clearHistory = () => {
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: "Session cleared. What would you like to know?",
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="p-8 max-w-3xl space-y-6 flex flex-col h-full">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-cyan-100 flex items-center gap-2">
            <Bot className="w-7 h-7 text-cyan-400" />
            JARVIS Coach
          </h1>
          <p className="text-cyan-500/50 mt-1 text-sm">
            AI advisor powered by your real stats — local-first
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-xs text-cyan-500/50 hover:text-cyan-300"
          onClick={clearHistory}
        >
          Clear history
        </Button>
      </header>

      {/* Suggested questions */}
      <CoachQuickPrompts onSelect={(q) => void sendMessage(q)} />

      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => void sendMessage(q)}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full border border-cyan-500/20 text-cyan-400/70 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message thread */}
      <Card glow className="flex-1 overflow-hidden flex flex-col min-h-[400px]">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 pt-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-cyan-500/15 border border-cyan-500/25 text-cyan-50"
                    : "bg-slate-800/60 border border-slate-700/50 text-cyan-100/90"
                }`}
              >
                <p>{msg.content}</p>
                {msg.role === "assistant" && (
                  <p className="text-[10px] text-cyan-500/40 mt-1.5 flex items-center gap-1">
                    {msg.usedAi ? (
                      <>
                        <Sparkles className="w-2.5 h-2.5" />
                        Claude AI
                      </>
                    ) : (
                      "Rule-based"
                    )}
                  </p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </CardContent>

        {/* Input */}
        <div className="border-t border-slate-700/50 p-4 flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your stats, streaks, XP strategy…"
            disabled={isLoading}
            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/20 text-cyan-50 text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
          />
          <Button
            variant="hologram"
            size="sm"
            disabled={!input.trim() || isLoading}
            onClick={() => void sendMessage(input)}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <p className="text-[11px] text-cyan-500/30 text-center">
        Stats-aware advisor. Set <code className="text-cyan-400">ANTHROPIC_API_KEY</code> for
        Claude AI mode. Data stays local — only your question is sent.
      </p>
    </div>
  );
}
