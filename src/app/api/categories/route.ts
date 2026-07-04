import { NextResponse } from "next/server";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";
import { getExtended, patchExtended } from "@/lib/player-settings-extended";
import type { CustomCategoryMeta } from "@/lib/player-settings-extended";
import type { Category } from "@/types/database";
import { randomUUID } from "crypto";

const CATEGORY_COLORS = [
  "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899",
];

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    const categoriesHolder = { value: [] as Category[] };
    await withGameState((state) => {
      categoriesHolder.value = state.categories;
    });

    return NextResponse.json({ categories: categoriesHolder.value });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}

export async function POST(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as {
    name?: string;
    color?: string;
    icon?: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const id = randomUUID();
  const slug = body.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  try {
    const resultHolder = { category: null as Category | null };
    await withGameState((state) => {
      const existing = state.categories.find((c) => c.slug === slug);
      if (existing) throw new Error("Category slug already exists");

      const colorIndex = state.categories.length % CATEGORY_COLORS.length;
      const color = body.color ?? CATEGORY_COLORS[colorIndex];

      const newCategory: Category = {
        id,
        user_id: state.profile.id,
        parent_id: null,
        slug,
        name: body.name!.trim(),
        description: null,
        icon: body.icon ?? null,
        color,
        category_type: "custom",
        sort_order: state.categories.length,
        base_xp: 50,
        level: 1,
        total_xp: 0,
        current_streak: 0,
        longest_streak: 0,
        rank: "E",
        is_system: false,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      state.categories.push(newCategory);

      const ext = getExtended(state.profile);
      const meta: CustomCategoryMeta = {
        id,
        name: newCategory.name,
        slug,
        color,
        icon: body.icon ?? null,
        created_at: newCategory.created_at,
      };
      patchExtended(state.profile, {
        custom_categories_meta: [...(ext.custom_categories_meta ?? []), meta],
      });

      resultHolder.category = newCategory;
    });

    return NextResponse.json({ success: true, category: resultHolder.category });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error && e.message === "Category slug already exists") {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    throw e;
  }
}

export async function PATCH(request: Request) {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({})) as {
    id?: string;
    name?: string;
    color?: string;
    icon?: string;
  };

  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  try {
    const resultHolder = { category: null as Category | null };
    await withGameState((state) => {
      const cat = state.categories.find((c) => c.id === body.id);
      if (!cat) throw new Error("Not found");
      if (cat.is_system) throw new Error("Cannot modify system category");

      if (body.name?.trim()) cat.name = body.name.trim();
      if (body.color) cat.color = body.color;
      if (body.icon !== undefined) cat.icon = body.icon ?? null;
      cat.updated_at = new Date().toISOString();

      const ext = getExtended(state.profile);
      const metas = (ext.custom_categories_meta ?? []).map((m) =>
        m.id === body.id
          ? { ...m, name: cat.name, color: cat.color, icon: cat.icon }
          : m
      );
      patchExtended(state.profile, { custom_categories_meta: metas });

      resultHolder.category = cat;
    });

    return NextResponse.json({ success: true, category: resultHolder.category });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error && (e.message === "Not found" || e.message === "Cannot modify system category")) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }
}
