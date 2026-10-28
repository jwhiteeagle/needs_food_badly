import {
  AH_MARKET,
  parseDealsData,
  parseGatheringData,
  itemIconUrl,
  type GatherItem,
  type MarketDeal,
} from "./market";
import { craftingUrl, parseCraftingData, type CraftRecipe } from "./crafting";

export const PINS_STORAGE_KEY = `needs-food-badly:pins:v1:${AH_MARKET}`;
export type PinnedItem =
  | { id: number; source: "tooltip"; data: GatherItem }
  | {
      id: number;
      source: "deal";
      data: MarketDeal;
      observedAt: string | null;
      attributionUrl: string;
    }
  | {
      id: number;
      source: "craft";
      data: CraftRecipe;
      observedAt: string | null;
      attributionUrl: string;
    };

// Restore only this market's validated snapshots; one damaged entry cannot erase the rest.
export function parseSavedPins(raw: string | null): PinnedItem[] {
  try {
    const saved = JSON.parse(raw ?? "null");
    if (saved?.market !== AH_MARKET || !Array.isArray(saved.items)) return [];
    const pins: PinnedItem[] = [];
    for (const entry of saved.items) {
      try {
        if (
          !Number.isSafeInteger(entry?.id) ||
          entry.id < 1 ||
          pins.some((pin) => pin.id === entry.id)
        )
          continue;
        if (entry.source === "tooltip" && entry.data?.id === entry.id) {
          const [data] = parseGatheringData(
            {
              market: { slug: AH_MARKET.replaceAll(".", "/") },
              items: [entry.data],
            },
            [entry.id],
          );
          if (data) pins.push({ id: entry.id, source: "tooltip", data });
        } else if (
          entry.source === "deal" &&
          entry.data?.item?.id === entry.id
        ) {
          const parsed = parseDealsData({
            market: AH_MARKET,
            deals: [entry.data],
            pricesAsOf: entry.observedAt,
            attribution: { url: entry.attributionUrl },
          });
          const data = parsed.deals[0]!;
          const icon = entry.data.item.icon;
          data.item.icon = itemIconUrl(icon);
          pins.push({
            id: entry.id,
            source: "deal",
            data,
            observedAt: parsed.pricesAsOf,
            attributionUrl: parsed.attributionUrl,
          });
        } else if (
          entry.source === "craft" &&
          entry.data?.result?.id === entry.id
        ) {
          const parsed = parseCraftingData(
            {
              market: AH_MARKET,
              filters: { profession: entry.data.recipe?.profession },
              recipes: [entry.data],
              pricesAsOf: entry.observedAt,
              attribution: { url: entry.attributionUrl },
            },
            entry.data.recipe?.profession,
          );
          const data = parsed.recipes[0];
          if (data)
            pins.push({
              id: entry.id,
              source: "craft",
              data,
              observedAt: parsed.pricesAsOf,
              attributionUrl: parsed.attributionUrl,
            });
        }
      } catch {
        // Ignore an invalid saved card without discarding valid favorites.
      }
    }
    return pins;
  } catch {
    return [];
  }
}

export function togglePinnedItem(
  pins: PinnedItem[],
  item: PinnedItem,
): PinnedItem[] {
  return pins.some((pin) => pin.id === item.id)
    ? pins.filter((pin) => pin.id !== item.id)
    : [...pins, item];
}

export function mergePinnedUpdates(
  pins: PinnedItem[],
  updates: PinnedItem[],
): PinnedItem[] {
  const byId = new Map(updates.map((pin) => [pin.id, pin]));
  return pins.map((pin) => {
    const update = byId.get(pin.id);
    if (update?.source !== pin.source) return pin;
    if (
      pin.source === "craft" &&
      update.source === "craft" &&
      pin.data.recipe.spellId !== update.data.recipe.spellId
    )
      return pin;
    return update;
  });
}

export function refreshPinnedDeal(
  pin: Extract<PinnedItem, { source: "deal" }>,
  value: unknown,
): PinnedItem {
  if (!value || typeof value !== "object")
    throw new Error("Invalid price response");
  const data = value as {
    market?: unknown;
    item?: { id?: unknown };
    latest?: Record<string, unknown> | null;
    attribution?: { url?: unknown };
    sales?: { estimatedPerDay?: unknown };
  };
  if (data.market !== AH_MARKET || data.item?.id !== pin.id)
    throw new Error("Unexpected item or market");
  if (data.latest !== null && (!data.latest || typeof data.latest !== "object"))
    throw new Error("Invalid latest price");
  const latest = data.latest;
  const buyout = latest === null ? null : latest.minBuyout;
  const baseline = latest === null ? null : latest.median30d;
  const discount =
    typeof buyout === "number" && typeof baseline === "number" && baseline > 0
      ? Math.max(0, 1 - buyout / baseline)
      : null;
  const parsed = parseDealsData({
    market: data.market,
    pricesAsOf: latest === null ? null : latest.observedAt,
    attribution: data.attribution ?? { url: pin.attributionUrl },
    deals: [
      {
        ...pin.data,
        minBuyout: buyout,
        median30d: baseline,
        discount,
        quantity: latest === null ? null : latest.quantity,
        salesPerDay: latest === null ? null : data.sales?.estimatedPerDay,
      },
    ],
  });
  const deal = parsed.deals[0]!;
  return {
    ...pin,
    data: { ...deal, item: { ...deal.item, icon: pin.data.item.icon } },
    observedAt: parsed.pricesAsOf,
    attributionUrl: parsed.attributionUrl,
  };
}

// Bulk tooltip refreshes for ordinary items; individual prices retain a deal's 30-day fields.
export async function refreshPinnedItems(
  pins: PinnedItem[],
  signal: AbortSignal,
): Promise<{ pins: PinnedItem[]; failed: boolean }> {
  async function get(url: string) {
    const response = await fetch(url, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
    });
    if (!response.ok) throw new Error("Pinned item refresh failed");
    return response.json();
  }
  const jobs: Promise<PinnedItem[]>[] = [];
  const ordinary = pins.filter((pin) => pin.source === "tooltip");
  for (let offset = 0; offset < ordinary.length; offset += 100) {
    const batch = ordinary.slice(offset, offset + 100);
    const ids = batch.map((pin) => pin.id);
    jobs.push(
      get(
        `https://api.ahledger.com/v1/tooltip/${AH_MARKET}?items=${ids.join(",")}`,
      ).then((value) => {
        const items = parseGatheringData(value, ids);
        return items.map((data) => ({
          id: data.id,
          source: "tooltip" as const,
          data,
        }));
      }),
    );
  }
  for (const pin of pins) {
    if (pin.source === "deal") {
      jobs.push(
        get(
          `https://api.ahledger.com/v1/prices/${AH_MARKET}/${pin.id}?range=7d`,
        ).then((value) => [refreshPinnedDeal(pin, value)]),
      );
    }
  }
  const craftPins = pins.filter((pin) => pin.source === "craft");
  for (const profession of new Set(
    craftPins.map((pin) => pin.data.recipe.profession),
  )) {
    jobs.push(
      get(craftingUrl(profession)).then((value) => {
        const data = parseCraftingData(value, profession);
        return craftPins
          .filter((pin) => pin.data.recipe.profession === profession)
          .flatMap((pin) => {
            const recipe = data.recipes.find(
              (recipe) =>
                recipe.recipe.spellId === pin.data.recipe.spellId &&
                recipe.result.id === pin.id,
            );
            return recipe
              ? [
                  {
                    ...pin,
                    data: {
                      ...recipe,
                      result: {
                        ...recipe.result,
                        icon: recipe.result.icon ?? pin.data.result.icon,
                      },
                    },
                    observedAt: data.pricesAsOf,
                    attributionUrl: data.attributionUrl,
                  },
                ]
              : [];
          });
      }),
    );
  }
  const results = await Promise.allSettled(jobs);
  signal.throwIfAborted();
  const updates = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  return {
    pins: mergePinnedUpdates(pins, updates),
    failed:
      results.some((result) => result.status === "rejected") ||
      updates.length !== pins.length,
  };
}
