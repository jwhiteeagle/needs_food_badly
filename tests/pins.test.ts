import { expect, test } from "bun:test";
import { craftResultItem } from "../src/crafting";
import { AH_MARKET } from "../src/market";
import {
  DEFAULT_GROUP,
  MAX_PINS,
  groupPins,
  mergePinnedUpdates,
  normalizeGroup,
  parseSavedPins,
  pinKey,
  refreshPinnedItems,
  togglePinnedItem,
  type PinSource,
  type PinnedItem,
} from "../src/pins";

const icon =
  "https://render.worldofwarcraft.com/classic1x-us/icons/56/inv_misc_flower_02.jpg";
const peacebloom: PinSource = {
  id: 2447,
  source: "tooltip",
  data: {
    id: 2447,
    name: "Peacebloom",
    icon,
    median: 200,
    minBuyout: 100,
    quantity: 12,
    observedAt: "2026-10-21T16:25:06Z",
    salesPerDay: null,
  },
};
const ordinary: PinnedItem = { ...peacebloom, group: DEFAULT_GROUP };
const craft: Extract<PinnedItem, { source: "craft" }> = {
  id: 11175,
  source: "craft",
  group: "Crafting",
  data: {
    recipe: {
      spellId: 22,
      name: "Greater Nether Essence",
      profession: "Alchemy",
      skillRequired: 300,
    },
    result: {
      id: 11175,
      name: "Greater Nether Essence",
      icon,
      url: `https://ahledger.com/items/11175/${AH_MARKET}?utm_source=ahledger_api`,
    },
    resultPrice: 200,
    cost: 100,
    netValue: 190,
    margin: 90,
    resultSalesPerDay: null,
    reagents: [{ id: 1, qty: 2, price: 50 }],
    unpriced: [],
  },
  observedAt: "2026-10-21T16:25:06Z",
  attributionUrl:
    "https://ahledger.com/crafting?market=forever/pvp/horde/us&profession=Alchemy&utm_source=ahledger_api",
};
const serialize = (items: unknown[]) =>
  JSON.stringify({ market: AH_MARKET, items });

test("restores the same source-specific cards, price fields, icons, categories, and attribution after serialization", () => {
  expect(parseSavedPins(serialize([ordinary, craft]))).toEqual([
    ordinary,
    craft,
  ]);
  const unknown = {
    ...ordinary,
    data: { ...ordinary.data, median: null, minBuyout: 0 },
  };
  expect(parseSavedPins(serialize([unknown]))).toEqual([unknown]);
});

test("isolates corrupt entries, deduplicates IDs, and rejects another saved market", () => {
  expect(parseSavedPins("broken JSON")).toEqual([]);
  expect(parseSavedPins(null)).toEqual([]);
  expect(
    parseSavedPins(
      JSON.stringify({ market: "forever.pvp.alliance.us", items: [ordinary] }),
    ),
  ).toEqual([]);
  expect(
    parseSavedPins(
      serialize([
        null,
        { ...ordinary, id: 999 },
        ordinary,
        ordinary,
        { ...craft, data: { ...craft.data, cost: -1 } },
        craft,
      ]),
    ),
  ).toEqual([ordinary, craft]);
  expect(parseSavedPins(serialize([{ ...ordinary, source: "deal" }]))).toEqual(
    [],
  );
  const unsafe = {
    ...craft,
    attributionUrl: "javascript:alert(1)",
    data: {
      ...craft.data,
      result: {
        ...craft.data.result,
        url: "https://evil.test",
        icon: "https://evil.test/icon.jpg",
      },
    },
  };
  const [restored] = parseSavedPins(serialize([unsafe]));
  expect(restored?.source).toBe("craft");
  if (restored?.source === "craft") {
    expect(restored.attributionUrl).toStartWith("https://ahledger.com/");
    expect(restored.data.result.url).toStartWith("https://ahledger.com/");
    expect(restored.data.result.icon).toBeNull();
  }
});

test("normalizes categories to short trimmed names with a default", () => {
  expect(normalizeGroup("  Raid   gear ")).toBe("Raid gear");
  expect(normalizeGroup("")).toBe(DEFAULT_GROUP);
  expect(normalizeGroup("   ")).toBe(DEFAULT_GROUP);
  expect(normalizeGroup(undefined)).toBe(DEFAULT_GROUP);
  expect(normalizeGroup(42)).toBe(DEFAULT_GROUP);
  expect(normalizeGroup("x".repeat(100))).toHaveLength(40);
  const [restored] = parseSavedPins(
    serialize([{ ...ordinary, group: undefined }]),
  );
  expect(restored?.group).toBe(DEFAULT_GROUP);
});

test("pinning is unique per item or craft, lands in the chosen category, and delayed refreshes cannot resurrect removed pins", () => {
  const pins = togglePinnedItem([ordinary], craft, "Crafting");
  expect(pins).toEqual([ordinary, craft]);
  expect(togglePinnedItem(pins, craft)).toEqual([ordinary]);
  expect(mergePinnedUpdates([ordinary], [craft])).toEqual([ordinary]);
});

test("a craft and its output item are separate pins that can coexist", () => {
  const outputItem: PinSource = {
    id: craft.id,
    source: "tooltip",
    data: craftResultItem(craft.data),
  };
  expect(pinKey(craft)).toBe("craft:22");
  expect(pinKey(outputItem)).toBe(`item:${craft.id}`);
  expect(outputItem.data.median).toBeNull();
  expect(outputItem.data.name).toBe(craft.data.result.name);
  const both = togglePinnedItem([craft], outputItem, "Crafting");
  expect(both.map(pinKey)).toEqual(["craft:22", `item:${craft.id}`]);
  expect(togglePinnedItem(both, outputItem).map(pinKey)).toEqual(["craft:22"]);
  expect(togglePinnedItem(both, craft).map(pinKey)).toEqual([
    `item:${craft.id}`,
  ]);
  const restored = parseSavedPins(serialize(both));
  expect(restored.map(pinKey)).toEqual(["craft:22", `item:${craft.id}`]);
  const other = {
    ...craft,
    data: { ...craft.data, recipe: { ...craft.data.recipe, spellId: 23 } },
  };
  expect(togglePinnedItem([craft], other)).toHaveLength(2);
});

test("a new pin reuses an existing category's spelling and blank input uses the default", () => {
  const [first] = togglePinnedItem([], peacebloom, "Herbs");
  const second = { ...peacebloom, id: 2449 };
  const pins = togglePinnedItem(first ? [first] : [], second, " herbs ");
  expect(pins.map((pin) => pin.group)).toEqual(["Herbs", "Herbs"]);
  expect(togglePinnedItem([], peacebloom, "")[0]?.group).toBe(DEFAULT_GROUP);
});

test("refuses new pins at the limit but still allows unpinning", () => {
  const full = Array.from({ length: MAX_PINS }, (_, index) => ({
    ...ordinary,
    id: index + 1,
    data: { ...ordinary.data, id: index + 1 },
  }));
  expect(togglePinnedItem(full, craft)).toBe(full);
  expect(
    togglePinnedItem(full, { ...peacebloom, id: full[0]!.id }),
  ).toHaveLength(MAX_PINS - 1);
  expect(
    parseSavedPins(serialize([...full, { ...ordinary, id: MAX_PINS + 1 }])),
  ).toHaveLength(MAX_PINS);
});

test("groups pins by category in first-pinned order", () => {
  const herbs = { ...ordinary, group: "Herbs" };
  const pins = [ordinary, herbs, { ...craft, group: DEFAULT_GROUP }];
  expect(groupPins(pins).map(({ name, pins }) => [name, pins.length])).toEqual([
    [DEFAULT_GROUP, 2],
    ["Herbs", 1],
  ]);
  expect(groupPins([])).toEqual([]);
});

test("refreshed data keeps each pin's category", () => {
  const sorted = { ...ordinary, group: "Herbs" };
  const refreshed = {
    ...peacebloom,
    data: { ...peacebloom.data, median: 300 },
  };
  const [merged] = mergePinnedUpdates([sorted], [refreshed]);
  expect(merged?.group).toBe("Herbs");
  expect(merged?.source === "tooltip" && merged.data.median).toBe(300);
});

test("batches ordinary pinned items, retains saved cards on partial failures, and honors cancellation", async () => {
  const originalFetch = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = (async (input) => {
    const url = String(input);
    urls.push(url);
    if (url.includes("/crafting/"))
      return new Response("Unavailable", { status: 503 });
    return Response.json({
      market: { slug: AH_MARKET.replaceAll(".", "/") },
      items: [{ ...ordinary.data, minBuyout: 50, salesPerDay: 0 }],
    });
  }) as typeof fetch;
  try {
    const result = await refreshPinnedItems(
      [ordinary, craft],
      new AbortController().signal,
    );
    expect(urls).toHaveLength(2);
    expect(result.failed).toBe(true);
    const first = result.pins[0];
    expect(first?.source).toBe("tooltip");
    if (first?.source === "tooltip") {
      expect(first.data.minBuyout).toBe(50);
      expect(first.data.salesPerDay).toBe(0);
      expect(first.group).toBe(DEFAULT_GROUP);
    }
    expect(result.pins[1]).toEqual(craft);
    expect(urls.some((url) => url.includes("/crafting/"))).toBe(true);
    await expect(
      refreshPinnedItems([ordinary], AbortSignal.abort()),
    ).rejects.toThrow();
  } finally {
    globalThis.fetch = originalFetch;
  }
});
