// AHledger boundary: one Forever market, copper prices, null means unavailable.
export const AH_MARKET = "forever.pvp.horde.us";
export const GATHER_ITEM_IDS = [2450, 2452, 785, 6291, 4306, 2770, 2836, 4234];
export const GATHER_URL = `https://api.ahledger.com/v1/tooltip/${AH_MARKET}?items=${GATHER_ITEM_IDS.join(",")}`;

export type GatherItem = {
  id: number;
  name: string;
  icon: string | null;
  median: number | null;
  minBuyout: number | null;
  quantity: number | null;
  observedAt: string | null;
  salesPerDay: number | null;
};

export function salesEstimate(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

export function itemIconUrl(value: unknown): string | null {
  return typeof value === "string" &&
    (value.startsWith("https://render.worldofwarcraft.com/") ||
      /^https:\/\/ahledger\.com\/icons\/[0-9]+\.jpg$/.test(value))
    ? value
    : null;
}

// Existing deal pins remain readable after replacing the deals feed with crafting.
export type MarketDeal = {
  item: { id: number; name: string; url: string; icon: string | null };
  minBuyout: number | null;
  median30d: number | null;
  discount: number | null;
  quantity: number | null;
  salesPerDay: number | null;
};

export type DealsData = {
  deals: MarketDeal[];
  pricesAsOf: string | null;
  attributionUrl: string;
};

function availableNumber(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === "number" && Number.isFinite(value) && value >= 0)
  );
}

function ahledgerUrl(value: unknown, fallback: string): string {
  return typeof value === "string" && value.startsWith("https://ahledger.com/")
    ? value
    : fallback;
}

export function parseDealsData(value: unknown): DealsData {
  if (!value || typeof value !== "object")
    throw new Error("Invalid deals response");
  const data = value as {
    market?: unknown;
    marketStatus?: unknown;
    deals?: MarketDeal[];
    pricesAsOf?: unknown;
    attribution?: { url?: unknown };
  };
  if (data.market !== AH_MARKET) throw new Error("Unexpected market");
  if (!Array.isArray(data.deals)) throw new Error("Missing deals");
  const pricesAsOf = data.pricesAsOf ?? null;
  if (
    pricesAsOf !== null &&
    (typeof pricesAsOf !== "string" || !Number.isFinite(Date.parse(pricesAsOf)))
  ) {
    throw new Error("Invalid scan timestamp");
  }
  const deals = data.deals.slice(0, 5).map((deal) => {
    if (
      !deal ||
      typeof deal !== "object" ||
      !deal.item ||
      !Number.isSafeInteger(deal.item.id) ||
      deal.item.id < 1 ||
      typeof deal.item.name !== "string" ||
      !availableNumber(deal.minBuyout) ||
      !availableNumber(deal.median30d) ||
      !availableNumber(deal.quantity) ||
      !availableNumber(deal.discount) ||
      (deal.discount !== null && deal.discount > 1)
    ) {
      throw new Error("Invalid deal data");
    }
    return {
      item: {
        id: deal.item.id,
        name: deal.item.name,
        icon: null,
        url: ahledgerUrl(
          deal.item.url,
          `https://ahledger.com/items/${deal.item.id}?market=forever/pvp/horde/us`,
        ),
      },
      minBuyout: deal.minBuyout,
      median30d: deal.median30d,
      discount: deal.discount,
      quantity: deal.quantity,
      salesPerDay: salesEstimate(deal.salesPerDay),
    };
  });
  return {
    deals,
    pricesAsOf,
    attributionUrl: ahledgerUrl(
      data.attribution?.url,
      "https://ahledger.com/deals?market=forever/pvp/horde/us",
    ),
  };
}

export function parseGatheringData(
  value: unknown,
  itemIds: readonly number[] = GATHER_ITEM_IDS,
): GatherItem[] {
  if (!value || typeof value !== "object")
    throw new Error("Invalid market response");
  const data = value as { market?: { slug?: unknown }; items?: unknown };
  if (data.market?.slug !== AH_MARKET.replaceAll(".", "/")) {
    throw new Error("Unexpected market");
  }
  if (!Array.isArray(data.items)) throw new Error("Missing market items");
  return data.items
    .map((row: unknown) => {
      if (!row || typeof row !== "object") throw new Error("Invalid item");
      const item = row as Partial<GatherItem>;
      if (
        !Number.isInteger(item.id) ||
        typeof item.name !== "string" ||
        !availableNumber(item.median) ||
        !availableNumber(item.minBuyout) ||
        !availableNumber(item.quantity) ||
        !(
          item.observedAt === null ||
          (typeof item.observedAt === "string" &&
            Number.isFinite(Date.parse(item.observedAt)))
        )
      ) {
        throw new Error("Invalid item data");
      }
      return {
        id: item.id!,
        name: item.name,
        icon: itemIconUrl(item.icon),
        median: item.median!,
        minBuyout: item.minBuyout!,
        quantity: item.quantity!,
        observedAt: item.observedAt!,
        salesPerDay: salesEstimate(item.salesPerDay),
      };
    })
    .filter((item) => itemIds.includes(item.id))
    .sort((a, b) => itemIds.indexOf(a.id) - itemIds.indexOf(b.id));
}

export function formatMoney(copper: number | null): string {
  if (copper === null) return "—";
  const total = Math.round(Math.abs(copper));
  const gold = Math.floor(total / 10000);
  const silver = Math.floor((total % 10000) / 100);
  const change = total % 100;
  const formatted =
    [gold && `${gold}g`, silver && `${silver}s`, change && `${change}c`]
      .filter(Boolean)
      .join(" ") || "0c";
  return copper < 0 && total > 0 ? `-${formatted}` : formatted;
}
