import { NextResponse } from "next/server";
import {
  getExtended,
  patchExtended,
  getShadowCoins,
  type ShopItem,
} from "@/lib/player-settings-extended";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

export interface ShopItemExtended extends ShopItem {
  item_type?: "reward" | "cosmetic";
  description?: string;
}

const COSMETIC_IDS = new Set([
  "hud_theme_cyan",
  "hud_theme_purple",
  "rank_border_gold",
  "particle_boost",
]);

const DEFAULT_SHOP: ShopItemExtended[] = [
  { id: "game", title: "Game session (1h)", cost: 50, stock: null, item_type: "reward", description: "1 hour guilt-free gaming" },
  { id: "cheat", title: "Cheat meal", cost: 200, stock: null, item_type: "reward", description: "One off-plan meal, no regrets" },
  { id: "rest", title: "Rest day pass", cost: 100, stock: null, item_type: "reward", description: "Full recovery day sanctioned" },
  { id: "hud_theme_cyan", title: "HUD Theme: Cyan", cost: 150, stock: null, item_type: "cosmetic", description: "Electric cyan interface overlay" },
  { id: "hud_theme_purple", title: "HUD Theme: Purple", cost: 150, stock: null, item_type: "cosmetic", description: "Deep violet interface skin" },
  { id: "rank_border_gold", title: "Rank Border: Gold", cost: 300, stock: null, item_type: "cosmetic", description: "Golden border around your rank badge" },
  { id: "particle_boost", title: "Particle Boost", cost: 250, stock: null, item_type: "cosmetic", description: "Enhanced XP particle effects" },
];

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    let items: ShopItemExtended[] = DEFAULT_SHOP;
    let coins = 0;
    let cosmetics: string[] = [];
    await withGameState((state) => {
      coins = getShadowCoins(state);
      const ext = getExtended(state.profile);
      const stored = ext.shop_items as ShopItemExtended[] | undefined;
      // Merge stored custom items with defaults (cosmetics always from defaults)
      items = stored
        ? DEFAULT_SHOP.map((d) => stored.find((s) => s.id === d.id) ?? d)
        : DEFAULT_SHOP;
      cosmetics = ext.cosmetics_owned ?? [];
    });
    return NextResponse.json({ items, coins, cosmetics_owned: cosmetics });
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

  const { itemId } = await request.json();
  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }

  try {
    let remaining = 0;
    let newCosmeticsOwned: string[] = [];
    await withGameState((state) => {
      const storedItems = getExtended(state.profile).shop_items as ShopItemExtended[] | undefined;
      const items: ShopItemExtended[] = storedItems
        ? DEFAULT_SHOP.map((d) => storedItems.find((s) => s.id === d.id) ?? d)
        : DEFAULT_SHOP;
      const item = items.find((i) => i.id === itemId);
      if (!item) throw new Error("Item not found");

      const isCosmetic = COSMETIC_IDS.has(itemId);
      const ext = getExtended(state.profile);
      if (isCosmetic && (ext.cosmetics_owned ?? []).includes(itemId)) {
        throw new Error("Already owned");
      }

      const coins = getShadowCoins(state);
      if (coins < item.cost) throw new Error("Not enough Shadow Coins");

      const next = coins - item.cost;
      const log = [
        ...(ext.coin_log ?? []),
        { at: new Date().toISOString(), delta: -item.cost, reason: `Purchased: ${item.title}` },
      ].slice(-50);

      const patch: Parameters<typeof patchExtended>[1] = {
        shadow_coins: next,
        coin_log: log,
        achievements_unlocked: {
          ...(ext.achievements_unlocked ?? {}),
          shop_spend: { unlocked_at: new Date().toISOString() },
        },
      };

      if (isCosmetic) {
        const owned = [...(ext.cosmetics_owned ?? []), itemId];
        patch.cosmetics_owned = owned;
        newCosmeticsOwned = owned;
      }

      patchExtended(state.profile, patch);
      remaining = next;
    });
    return NextResponse.json({ success: true, coins: remaining, cosmetics_owned: newCosmeticsOwned });
  } catch (e) {
    if (e instanceof GameAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }
}
