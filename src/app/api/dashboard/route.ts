import { NextResponse } from "next/server";
import { getDemoDashboard } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";
import type { DashboardStats, Habit, Supplement } from "@/types/database";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(getDemoDashboard());
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(getDemoDashboard());
    }

    const today = todayISO();

    const [profileRes, categoriesRes, habitsRes, supplementsRes, questsRes, dailyRes, xpRes, logsRes] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("categories")
          .select("*")
          .or(`user_id.eq.${user.id},user_id.is.null`)
          .order("sort_order"),
        supabase
          .from("habits")
          .select("*")
          .or(`user_id.eq.${user.id},user_id.is.null`)
          .eq("is_active", true),
        supabase
          .from("supplements")
          .select("*")
          .or(`user_id.eq.${user.id},user_id.is.null`)
          .eq("is_active", true),
        supabase
          .from("quests")
          .select("*")
          .or(`user_id.eq.${user.id},user_id.is.null`)
          .eq("status", "active")
          .limit(20),
        supabase
          .from("daily_completions")
          .select("*")
          .eq("user_id", user.id)
          .eq("completion_date", today)
          .maybeSingle(),
        supabase
          .from("xp_events")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("habit_logs")
          .select("habit_id")
          .eq("user_id", user.id)
          .eq("logged_at", today)
          .eq("completed", true),
      ]);

    const completedIds = new Set(
      (logsRes.data ?? []).map((l: { habit_id: string }) => l.habit_id)
    );

    const habits: Habit[] = (habitsRes.data ?? []).map((h: Habit) => ({
      ...h,
      completed_today: completedIds.has(h.id),
    }));

    const supplementLogsRes = await supabase
      .from("supplement_logs")
      .select("supplement_id")
      .eq("user_id", user.id)
      .eq("logged_at", today)
      .eq("taken", true);

    const takenIds = new Set(
      (supplementLogsRes.data ?? []).map(
        (l: { supplement_id: string }) => l.supplement_id
      )
    );

    const stats: DashboardStats = {
      profile: profileRes.data,
      categories: categoriesRes.data ?? [],
      habits,
      supplements: (supplementsRes.data ?? []).map((s: Supplement) => ({
        ...s,
        taken_today: takenIds.has(s.id),
      })),
      quests: questsRes.data ?? [],
      dailyCompletion: dailyRes.data,
      recentXpEvents: xpRes.data ?? [],
    };

    if (!stats.profile) {
      return NextResponse.json(getDemoDashboard());
    }

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(getDemoDashboard());
  }
}
