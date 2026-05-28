import { NextResponse } from "next/server";
import {
  getExtended,
  patchExtended,
  getShadowCoins,
  type ShopItem,
} from "@/lib/player-settings-extended";
import { isLocalAuthMode } from "@/lib/auth/config";
import { GameAuthError, withGameState } from "@/lib/local/game-action";

const DEFAULT_SHOP = [
  { id: "game", title: "Game session (1h)", cost: 50, stock: null },
  { id: "cheat", title: "Cheat meal", cost: 200, stock: null },
  { id: "rest", title: "Rest day pass", cost: 100, stock: null },
];

export async function GET() {
  if (!isLocalAuthMode()) {
    return NextResponse.json({ error: "Local mode only" }, { status: 400 });
  }

  try {
    let items: ShopItem[] = DEFAULT_SHOP;
    let coins = 0;
    await withGameState((state) => {
      coins = getShadowCoins(state);
      items = (getExtended(state.profile).shop_items ?? DEFAULT_SHOP) as ShopItem[];
    });
    return NextResponse.json({ items, coins });
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
    await withGameState((state) => {
      const items = getExtended(state.profile).shop_items ?? DEFAULT_SHOP;
      const item = items.find((i) => i.id === itemId);
      if (!item) throw new Error("Item not found");

      const coins = getShadowCoins(state);
      if (coins < item.cost) throw new Error("Not enough Shadow Coins");

      const next = coins - item.cost;
      const log = [
        ...(getExtended(state.profile).coin_log ?? []),
        { at: new Date().toISOString(), delta: -item.cost, reason: `Purchased: ${item.title}` },
      ].slice(-50);
      patchExtended(state.profile, {
        shadow_coins: next,
        coin_log: log,
        achievements_unlocked: {
          ...(getExtended(state.profile).achievements_unlocked ?? {}),
          shop_spend: { unlocked_at: new Date().toISOString() },
        },
      });
      remaining = next;
    });
    return NextResponse.json({ success: true, coins: remaining });
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
