import { expect, test } from "bun:test";
import { AH_MARKET, formatMoney } from "../src/market";
import {
  CRAFT_PROFESSIONS,
  craftReturnPercent,
  parseCraftingData,
  attachCraftIcons,
} from "../src/crafting";
import {
  parseSavedPins,
  refreshPinnedItems,
  mergePinnedUpdates,
  type PinnedItem,
} from "../src/pins";

const icon = "https://render.worldofwarcraft.com/us/icons/56/trade_alchemy.jpg";
const recipe = {
  recipe: {
    spellId: 100,
    name: "Test Potion",
    profession: "Alchemy",
    skillRequired: 25,
  },
  result: {
    id: 1000,
    name: "Test Potion",
    icon,
    url: "https://ahledger.com/items/1000?utm_campaign=crafting",
  },
  resultPrice: 200,
  cost: 90,
  netValue: 190,
  margin: 100,
  resultSalesPerDay: null,
  reagents: [{ id: 2000, qty: 2, price: 45 }],
  unpriced: [],
};
const response = (recipes: unknown[]) => ({
  market: AH_MARKET,
  filters: { profession: "Alchemy", all: false },
  recipes,
  pricesAsOf: "2026-10-21T16:25:06Z",
  attribution: {
    url: "https://ahledger.com/crafting?market=forever/pvp/horde/us&utm_source=ahledger_api",
  },
});

test("ranks fully priced recipes by margin per craft rather than ROI or daily profit", () => {
  const parsed = parseCraftingData(
    response([
      {
        ...recipe,
        recipe: { ...recipe.recipe, spellId: 1 },
        margin: 30,
        marginRatio: 1000,
        profitPerDay: 999999,
      },
      {
        ...recipe,
        recipe: { ...recipe.recipe, spellId: 2 },
        margin: 500,
        marginRatio: 0.1,
        profitPerDay: 1,
      },
      { ...recipe, recipe: { ...recipe.recipe, spellId: 3 }, margin: -10 },
      recipe,
    ]),
    "Alchemy",
  );
  expect(parsed.recipes.slice(0, 3).map((row) => row.margin)).toEqual([
    500, 100, 30,
  ]);
  expect(parsed.recipes[3]?.margin).toBe(-10);
  expect(parsed.attributionUrl).toBe(response([]).attribution.url);
});

test("calculates signed return on reagent cost without inventing an infinite return", () => {
  expect(craftReturnPercent({ margin: 100, cost: 90 })).toBe(111.1);
  expect(craftReturnPercent({ margin: -25, cost: 100 })).toBe(-25);
  expect(craftReturnPercent({ margin: 0, cost: 100 })).toBe(0);
  expect(craftReturnPercent({ margin: 100, cost: 0 })).toBeNull();
  expect(Object.is(craftReturnPercent({ margin: -0.001, cost: 100 }), -0)).toBe(
    false,
  );
});

test("preserves crafted-item sold/day independently of profit/day and handles missing estimates", () => {
  for (const [value, expected] of [
    [undefined, null],
    [null, null],
    ["", null],
    [0, 0],
    [4.25, 4.25],
    [-1, null],
  ] as const) {
    const data = parseCraftingData(
      response([{ ...recipe, resultSalesPerDay: value, profitPerDay: 999999 }]),
      "Alchemy",
    );
    expect(data.recipes[0]?.resultSalesPerDay).toBe(expected);
  }
});

test("keeps seven active professions without erasing previously pinned craft snapshots", () => {
  expect(CRAFT_PROFESSIONS.map((profession) => profession.name)).toEqual([
    "Alchemy",
    "Blacksmithing",
    "Cooking",
    "Engineering",
    "Leatherworking",
    "Mining",
    "Tailoring",
  ]);
  const oldRecipe = {
    ...recipe,
    recipe: { ...recipe.recipe, profession: "First Aid" },
  };
  const restored = parseSavedPins(
    JSON.stringify({
      market: AH_MARKET,
      items: [
        {
          id: recipe.result.id,
          source: "craft",
          data: oldRecipe,
          observedAt: response([]).pricesAsOf,
          attributionUrl: response([]).attribution.url,
        },
      ],
    }),
  );
  expect(restored).toHaveLength(1);
});

test("excludes unknown ingredients or result prices without treating genuine zero as missing", () => {
  const parsed = parseCraftingData(
    response([
      { ...recipe, cost: null },
      { ...recipe, resultPrice: null },
      { ...recipe, unpriced: [2000] },
      { ...recipe, reagents: [{ id: 2000, qty: 2, price: null }] },
      { ...recipe, recipe: { ...recipe.recipe, profession: "Tailoring" } },
      { ...recipe, margin: NaN },
      {
        ...recipe,
        resultPrice: 0,
        cost: 0,
        netValue: 0,
        margin: 0,
        reagents: [{ id: 2000, qty: 1, price: 0 }],
      },
    ]),
    "Alchemy",
  );
  expect(parsed.recipes).toHaveLength(1);
  expect(parsed.recipes[0]?.margin).toBe(0);
  expect(parseCraftingData(response([]), "Alchemy").recipes).toEqual([]);
  expect(formatMoney(-10695)).toBe("-1g 6s 95c");
  expect(formatMoney(-29.35)).toBe("-29c");
  expect(formatMoney(-0.1)).toBe("0c");
});

test("requires the requested profession and market and rejects unsafe icon sources", () => {
  expect(() =>
    parseCraftingData(
      { ...response([]), market: "forever.pvp.alliance.us" },
      "Alchemy",
    ),
  ).toThrow("Unexpected market");
  expect(() => parseCraftingData(response([]), "Tailoring")).toThrow(
    "Unexpected profession",
  );
  expect(() =>
    parseCraftingData({ ...response([]), pricesAsOf: "invalid" }, "Alchemy"),
  ).toThrow("Invalid scan timestamp");
  const data = parseCraftingData(
    response([
      {
        ...recipe,
        result: {
          ...recipe.result,
          icon: "https://evil.test/icon.jpg",
          url: "javascript:alert(1)",
        },
      },
    ]),
    "Alchemy",
  );
  expect(data.recipes[0]?.result.icon).toBeNull();
  expect(data.recipes[0]?.result.url).toStartWith("https://ahledger.com/");
});

test("attaches result icons by ID without replacing calculated craft margins", () => {
  const data = parseCraftingData(response([recipe]), "Alchemy");
  const enriched = attachCraftIcons(data, {
    market: { slug: AH_MARKET.replaceAll(".", "/") },
    items: [
      {
        id: 1000,
        name: "Test Potion",
        icon,
        median: 999999,
        minBuyout: 999999,
        quantity: 1,
        observedAt: null,
      },
    ],
  });
  expect(enriched.recipes[0]?.result.icon).toBe(icon);
  expect(enriched.recipes[0]?.margin).toBe(100);
  expect(enriched.recipes[0]?.resultPrice).toBe(200);
});

test("restores craft pins and refreshes a recipe below the top three using one request per profession", async () => {
  const data = parseCraftingData(response([recipe]), "Alchemy");
  const pin: Extract<PinnedItem, { source: "craft" }> = {
    id: recipe.result.id,
    source: "craft",
    data: data.recipes[0]!,
    observedAt: data.pricesAsOf,
    attributionUrl: data.attributionUrl,
  };
  const second: typeof pin = {
    ...pin,
    id: 1001,
    data: {
      ...pin.data,
      recipe: { ...pin.data.recipe, spellId: 101 },
      result: { ...pin.data.result, id: 1001 },
    },
  };
  expect(
    parseSavedPins(JSON.stringify({ market: AH_MARKET, items: [pin, second] })),
  ).toEqual([pin, second]);
  const differentRecipe = {
    ...pin,
    data: { ...pin.data, recipe: { ...pin.data.recipe, spellId: 999 } },
  };
  expect(mergePinnedUpdates([differentRecipe], [pin])).toEqual([
    differentRecipe,
  ]);
  const originalFetch = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = (async (input) => {
    urls.push(String(input));
    return Response.json(
      response([
        ...[100, 200, 300].map((margin, index) => ({
          ...recipe,
          margin,
          recipe: { ...recipe.recipe, spellId: 500 + index },
        })),
        { ...recipe, margin: -25, resultSalesPerDay: 7.25 },
        { ...second.data, margin: -50 },
      ]),
    );
  }) as typeof fetch;
  try {
    const refreshed = await refreshPinnedItems(
      [pin, second],
      new AbortController().signal,
    );
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain(`crafting/${AH_MARKET}?profession=Alchemy`);
    expect(refreshed.failed).toBe(false);
    const updated = refreshed.pins[0];
    if (updated?.source !== "craft") throw new Error("Wrong pin source");
    expect(updated.data.margin).toBe(-25);
    expect(updated.data.resultSalesPerDay).toBe(7.25);
    expect(updated.data.result.icon).toBe(icon);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
