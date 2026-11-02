import { AH_MARKET, parseGatheringData, type GatherItem } from "./market";
import { craftingUrl, parseCraftingData, type CraftRecipe } from "./crafting";

// v2 adds categories and drops the retired deals source; v1 entries are not migrated
export const PINS_STORAGE_KEY = `needs-food-badly:pins:v2:${AH_MARKET}`;
export const MAX_PINS = 100;
export const DEFAULT_GROUP = "Favorites";
export const MAX_GROUP_LENGTH = 40;

// What a card offers to pin; the saved pin adds the user's category
export type PinSource =
  | { id: number; source: "tooltip"; data: GatherItem }
  | {
      id: number;
      source: "craft";
      data: CraftRecipe;
      observedAt: string | null;
      attributionUrl: string;
    };
export type PinnedItem = PinSource & { group: string };

// An item and a craft for the same output are separate pins
export const pinKey = (pin: PinSource) =>
  pin.source === "craft"
    ? `craft:${pin.data.recipe.spellId}`
    : `item:${pin.id}`;

// Categories are plain trimmed names; blank input falls back to the default
export function normalizeGroup(value: unknown): string {
  const name =
    typeof value === "string"
      ? value.replace(/\s+/g, " ").trim().slice(0, MAX_GROUP_LENGTH).trim()
      : "";
  return name || DEFAULT_GROUP;
}

// Group order follows each group's first pin, so saved order is display order
export function groupPins(
  pins: PinnedItem[],
): { name: string; pins: PinnedItem[] }[] {
  const groups = new Map<string, PinnedItem[]>();
  for (const pin of pins) {
    const members = groups.get(pin.group);
    if (members) members.push(pin);
    else groups.set(pin.group, [pin]);
  }
  return [...groups].map(([name, members]) => ({ name, pins: members }));
}

// Restore only this market's validated snapshots; one damaged entry cannot erase the rest.
export function parseSavedPins(raw: string | null): PinnedItem[] {
  try {
    const saved = JSON.parse(raw ?? "null");
    if (saved?.market !== AH_MARKET || !Array.isArray(saved.items)) return [];
    const pins: PinnedItem[] = [];
    for (const entry of saved.items) {
      if (pins.length >= MAX_PINS) break;
      try {
        if (!Number.isSafeInteger(entry?.id) || entry.id < 1) continue;
        const group = normalizeGroup(entry.group);
        const add = (pin: PinnedItem) => {
          if (!pins.some((saved) => pinKey(saved) === pinKey(pin)))
            pins.push(pin);
        };
        if (entry.source === "tooltip" && entry.data?.id === entry.id) {
          const [data] = parseGatheringData(
            {
              market: { slug: AH_MARKET.replaceAll(".", "/") },
              items: [entry.data],
            },
            [entry.id],
          );
          if (data) add({ id: entry.id, source: "tooltip", data, group });
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
            add({
              id: entry.id,
              source: "craft",
              data,
              observedAt: parsed.pricesAsOf,
              attributionUrl: parsed.attributionUrl,
              group,
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

// Unpins a saved key, otherwise appends to the category unless the pin limit is reached
export function togglePinnedItem(
  pins: PinnedItem[],
  item: PinSource,
  group: string = DEFAULT_GROUP,
): PinnedItem[] {
  const key = pinKey(item);
  if (pins.some((pin) => pinKey(pin) === key))
    return pins.filter((pin) => pinKey(pin) !== key);
  if (pins.length >= MAX_PINS) return pins;
  // Reuse an existing category's spelling so "armor" cannot split "Armor"
  const name = normalizeGroup(group);
  const existing = pins.find(
    (pin) => pin.group.toLowerCase() === name.toLowerCase(),
  );
  return [...pins, { ...item, group: existing?.group ?? name }];
}

// Refreshed data replaces a card's snapshot but never its category
export function mergePinnedUpdates(
  pins: PinnedItem[],
  updates: PinSource[],
): PinnedItem[] {
  const byKey = new Map(updates.map((pin) => [pinKey(pin), pin]));
  return pins.map((pin) => {
    const update = byKey.get(pinKey(pin));
    return update ? { ...update, group: pin.group } : pin;
  });
}

// Bulk tooltip refreshes for ordinary items; craft pins refresh once per profession.
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
  const jobs: Promise<PinSource[]>[] = [];
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
