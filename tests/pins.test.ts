import { expect, test } from "bun:test";
import { AH_MARKET } from "../src/market";
import {
  parseSavedPins,
  togglePinnedItem,
  mergePinnedUpdates,
  refreshPinnedDeal,
  refreshPinnedItems,
  type PinnedItem,
} from "../src/pins";

const icon =
  "https://render.worldofwarcraft.com/classic1x-us/icons/56/inv_misc_flower_02.jpg";
const ordinary: PinnedItem = {
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
const deal: Extract<PinnedItem, { source: "deal" }> = {
  id: 11175,
  source: "deal",
  data: {
    item: {
      id: 11175,
      name: "Greater Nether Essence",
      icon,
      url: `https://ahledger.com/items/11175/${AH_MARKET}?utm_source=ahledger_api`,
    },
    minBuyout: 100,
    median30d: 200,
    discount: 0.5,
    quantity: 12,
    salesPerDay: null,
  },
  observedAt: "2026-10-21T16:25:06Z",
  attributionUrl:
    "https://ahledger.com/deals?market=forever/pvp/horde/us&utm_source=ahledger_api",
};
const serialize = (items: unknown[]) =>
  JSON.stringify({ market: AH_MARKET, items });

test("restores the same source-specific cards, price fields, icons, and attribution after serialization", () => {
  expect(parseSavedPins(serialize([ordinary, deal]))).toEqual([ordinary, deal]);
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
        { ...deal, data: { ...deal.data, minBuyout: -1 } },
        deal,
      ]),
    ),
  ).toEqual([ordinary, deal]);
  const unsafe = {
    ...deal,
    attributionUrl: "javascript:alert(1)",
    data: {
      ...deal.data,
      item: {
        ...deal.data.item,
        url: "https://evil.test",
        icon: "https://evil.test/icon.jpg",
      },
    },
  };
  const [restored] = parseSavedPins(serialize([unsafe]));
  expect(restored?.source).toBe("deal");
  if (restored?.source === "deal") {
    expect(restored.attributionUrl).toStartWith("https://ahledger.com/");
    expect(restored.data.item.url).toStartWith("https://ahledger.com/");
    expect(restored.data.item.icon).toBeNull();
  }
});

test("pinning is unique by item ID and delayed refreshes cannot resurrect removed pins", () => {
  const pins = togglePinnedItem([ordinary], deal);
  expect(pins).toEqual([ordinary, deal]);
  expect(togglePinnedItem(pins, deal)).toEqual([ordinary]);
  expect(mergePinnedUpdates([ordinary], [deal])).toEqual([ordinary]);
  const sameIdDifferentSource = {
    ...deal,
    id: ordinary.id,
    data: { ...deal.data, item: { ...deal.data.item, id: ordinary.id } },
  };
  expect(mergePinnedUpdates([ordinary], [sameIdDifferentSource])).toEqual([
    ordinary,
  ]);
  expect(togglePinnedItem([ordinary], sameIdDifferentSource)).toEqual([]);
});

const priceResponse = {
  market: AH_MARKET,
  item: { id: deal.id },
  sales: { estimatedPerDay: 12.5 },
  latest: {
    minBuyout: 150,
    median30d: 300,
    quantity: 8,
    observedAt: "2026-10-22T10:00:00Z",
  },
  attribution: {
    url: `https://ahledger.com/items/${deal.id}?utm_campaign=prices`,
  },
};

test("refreshes pinned deal fields by ID even after the item leaves the deals list", () => {
  const updated = refreshPinnedDeal(deal, priceResponse);
  expect(updated.source).toBe("deal");
  if (updated.source !== "deal") throw new Error("Wrong source");
  expect(updated.data.minBuyout).toBe(150);
  expect(updated.data.median30d).toBe(300);
  expect(updated.data.discount).toBe(0.5);
  expect(updated.data.salesPerDay).toBe(12.5);
  expect(updated.data.item.icon).toBe(icon);
  expect(updated.attributionUrl).toBe(priceResponse.attribution.url);
  const above = refreshPinnedDeal(deal, {
    ...priceResponse,
    latest: { ...priceResponse.latest, minBuyout: 400 },
  });
  if (above.source === "deal") expect(above.data.discount).toBe(0);
  const unknown = refreshPinnedDeal(deal, { ...priceResponse, latest: null });
  if (unknown.source === "deal") {
    expect(unknown.data.minBuyout).toBeNull();
    expect(unknown.data.salesPerDay).toBeNull();
    expect(unknown.observedAt).toBeNull();
  }
  expect(() =>
    refreshPinnedDeal(deal, { ...priceResponse, item: { id: 999 } }),
  ).toThrow();
  expect(() =>
    refreshPinnedDeal(deal, {
      ...priceResponse,
      market: "forever.pvp.alliance.us",
    }),
  ).toThrow();
});

test("batches ordinary pinned items, retains saved cards on partial failures, and honors cancellation", async () => {
  const originalFetch = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = (async (input) => {
    const url = String(input);
    urls.push(url);
    if (url.includes("/prices/"))
      return new Response("Unavailable", { status: 503 });
    return Response.json({
      market: { slug: AH_MARKET.replaceAll(".", "/") },
      items: [{ ...ordinary.data, minBuyout: 50, salesPerDay: 0 }],
    });
  }) as typeof fetch;
  try {
    const result = await refreshPinnedItems(
      [ordinary, deal],
      new AbortController().signal,
    );
    expect(urls).toHaveLength(2);
    expect(result.failed).toBe(true);
    const first = result.pins[0];
    expect(first?.source).toBe("tooltip");
    if (first?.source === "tooltip") {
      expect(first.data.minBuyout).toBe(50);
      expect(first.data.salesPerDay).toBe(0);
    }
    expect(result.pins[1]).toEqual(deal);
    expect(
      urls.some((url) => url.includes(`/prices/${AH_MARKET}/${deal.id}`)),
    ).toBe(true);
    expect(urls.some((url) => url.includes("/deals/"))).toBe(false);
    await expect(
      refreshPinnedItems([ordinary], AbortSignal.abort()),
    ).rejects.toThrow();
  } finally {
    globalThis.fetch = originalFetch;
  }
});
