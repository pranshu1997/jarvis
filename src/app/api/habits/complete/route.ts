import { NextResponse } from "next/server";
import { calculateXp } from "@/lib/xp-engine";
import { getDemoDashboard } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();
  const { habitId, completed = true } = body as {
    habitId: string;
    completed?: boolean;
  };

  if (!habitId) {
    return NextResponse.json({ error: "habitId required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    const demo = getDemoDashboard();
    const habit = demo.habits.find((h) => h.id === habitId);
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    const xp = calculateXp({
      baseXp: habit.base_xp,
      streakDays: habit.current_streak,
      momentumScore: demo.profile.momentum_score,
      consistencyScore: demo.profile.consistency_score,
    });
    return NextResponse.json({
      success: true,
      xpEarned: completed ? xp.finalXp : 0,
      multipliers: xp.multipliers,
      demo: true,
    });
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: habit } = await supabase
      .from("habits")
      .select("*")
      .eq("id", habitId)
      .single();

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const today = todayISO();

    if (completed) {
      const xp = calculateXp({
        baseXp: habit.base_xp,
        streakDays: habit.current_streak,
        momentumScore: profile?.momentum_score ?? 0,
        consistencyScore: profile?.consistency_score ?? 0,
      });

      await supabase.from("habit_logs").upsert({
        user_id: user.id,
        habit_id: habitId,
        logged_at: today,
        completed: true,
        xp_earned: xp.finalXp,
      });

      await supabase.from("xp_events").insert({
        user_id: user.id,
        entity_type: "habit",
        entity_id: habitId,
        base_xp: xp.baseXp,
        final_xp: xp.finalXp,
        streak_multiplier: xp.multipliers.streak,
        combo_multiplier: xp.multipliers.combo,
        consistency_multiplier: xp.multipliers.consistency,
        momentum_multiplier: xp.multipliers.momentum,
        bonus_multiplier: xp.multipliers.bonus,
        reason: `${habit.name} completed`,
      });

      await supabase
        .from("habits")
        .update({
          total_xp: habit.total_xp + xp.finalXp,
          current_streak: habit.current_streak + 1,
        })
        .eq("id", habitId);

      if (profile) {
        await supabase
          .from("profiles")
          .update({
            total_xp: profile.total_xp + xp.finalXp,
          })
          .eq("id", user.id);
      }

      return NextResponse.json({
        success: true,
        xpEarned: xp.finalXp,
        multipliers: xp.multipliers,
      });
    }

    await supabase
      .from("habit_logs")
      .delete()
      .eq("user_id", user.id)
      .eq("habit_id", habitId)
      .eq("logged_at", today);

    return NextResponse.json({ success: true, xpEarned: 0 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
