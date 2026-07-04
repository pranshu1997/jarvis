import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { buildStatsSummary, buildStatsPromptContext, getRuleBasedAnswer } from "@/lib/coach-insights";
import { appendCoachMessage, coachHistoryForPrompt } from "@/lib/coach-memory";

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const { question } = body as { question?: string };

  if (!question?.trim()) {
    return NextResponse.json({ error: "question required" }, { status: 400 });
  }

  try {
    let answer = "";
    let usedAi = false;

    const summaryHolder = { value: null as ReturnType<typeof buildStatsSummary> | null };
    await withGameState((state) => {
      summaryHolder.value = buildStatsSummary(state);
    });

    const summary = summaryHolder.value!;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const historyContext = await (async () => {
      let ctx = "";
      await withGameState((state) => {
        appendCoachMessage(state.profile, "user", question.trim());
        ctx = coachHistoryForPrompt(state.profile);
      });
      return ctx;
    })();

    if (apiKey) {
      try {
        const context = buildStatsPromptContext(summary);
        const systemPrompt = `You are FORGE Coach, a concise AI advisor for a gamified self-improvement app called Forge.
You have access to the player's real stats. Answer in 2-4 sentences max — direct, actionable, motivating. 
Use game terminology (XP, streaks, ranks, multipliers) naturally. No markdown formatting in your response.

Player stats:
${context}
${historyContext ? `\nRecent conversation:\n${historyContext}` : ""}`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 300,
            system: systemPrompt,
            messages: [{ role: "user", content: question }],
          }),
        });

        if (response.ok) {
          const data = await response.json() as {
            content: { type: string; text: string }[];
          };
          const text = data.content?.find((c) => c.type === "text")?.text;
          if (text) {
            answer = text.trim();
            usedAi = true;
          }
        }
      } catch {
        // Fall through to rule-based
      }
    }

    if (!answer) {
      answer = getRuleBasedAnswer(question, summary);
    }

    await withGameState((state) => {
      appendCoachMessage(state.profile, "assistant", answer);
    });

    return NextResponse.json({ answer, usedAi, summary });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}
