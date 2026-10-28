import {
  AH_MARKET,
  parseGatheringData,
  itemIconUrl,
  salesEstimate,
} from "./market";

const professionIcons = {
  Alchemy: "trade_alchemy",
  Blacksmithing: "trade_blacksmithing",
  Cooking: "inv_misc_food_15",
  Engineering: "trade_engineering",
  Leatherworking: "trade_leatherworking",
  Mining: "trade_mining",
  Tailoring: "trade_tailoring",
};
export const CRAFT_PROFESSIONS = Object.entries(professionIcons).map(
  ([name, icon]) => ({
    name,
    icon: `https://render.worldofwarcraft.com/us/icons/56/${icon}.jpg`,
  }),
);
export const craftingUrl = (profession: string) =>
  `https://api.ahledger.com/v1/crafting/${AH_MARKET}?profession=${encodeURIComponent(profession)}&limit=500`;

export type CraftRecipe = {
  recipe: {
    spellId: number;
    name: string;
    profession: string;
    skillRequired: number | null;
  };
  result: { id: number; name: string; icon: string | null; url: string };
  resultPrice: number;
  cost: number;
  netValue: number;
  margin: number;
  resultSalesPerDay: number | null;
  reagents: { id: number; qty: number; price: number }[];
  unpriced: [];
};
export type CraftingData = {
  profession: string;
  recipes: CraftRecipe[];
  pricesAsOf: string | null;
  attributionUrl: string;
};

export function craftReturnPercent(
  recipe: Pick<CraftRecipe, "margin" | "cost">,
): number | null {
  if (recipe.cost <= 0) return null;
  const percent = Math.round((recipe.margin / recipe.cost) * 1000) / 10;
  return Number.isFinite(percent) ? percent || 0 : null;
}

const nonnegative = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
const itemUrl = (value: unknown, fallback: string) =>
  typeof value === "string" && value.startsWith("https://ahledger.com/")
    ? value
    : fallback;

// Margin is AHledger's per-craft net sale value (after its 5% cut) minus reagent cost.
export function parseCraftingData(
  value: unknown,
  profession: string,
): CraftingData {
  if (!value || typeof value !== "object")
    throw new Error("Invalid crafting response");
  const data = value as {
    market?: unknown;
    filters?: { profession?: unknown };
    recipes?: CraftRecipe[];
    pricesAsOf?: unknown;
    attribution?: { url?: unknown };
  };
  if (data.market !== AH_MARKET) throw new Error("Unexpected market");
  if (
    typeof profession !== "string" ||
    !profession ||
    data.filters?.profession !== profession
  )
    throw new Error("Unexpected profession");
  if (!Array.isArray(data.recipes)) throw new Error("Missing recipes");
  const pricesAsOf = data.pricesAsOf ?? null;
  if (
    pricesAsOf !== null &&
    (typeof pricesAsOf !== "string" || !Number.isFinite(Date.parse(pricesAsOf)))
  )
    throw new Error("Invalid scan timestamp");
  const recipes: CraftRecipe[] = [];
  for (const row of data.recipes) {
    if (
      !row ||
      typeof row !== "object" ||
      !row.recipe ||
      !row.result ||
      row.recipe.profession !== profession ||
      !Number.isSafeInteger(row.recipe.spellId) ||
      row.recipe.spellId < 1 ||
      !Number.isSafeInteger(row.result.id) ||
      row.result.id < 1 ||
      typeof row.recipe.name !== "string" ||
      typeof row.result.name !== "string" ||
      !nonnegative(row.resultPrice) ||
      !nonnegative(row.cost) ||
      !nonnegative(row.netValue) ||
      typeof row.margin !== "number" ||
      !Number.isFinite(row.margin) ||
      !Array.isArray(row.unpriced) ||
      row.unpriced.length !== 0 ||
      !Array.isArray(row.reagents) ||
      row.reagents.some(
        (reagent) =>
          !reagent ||
          !Number.isSafeInteger(reagent.id) ||
          reagent.id < 1 ||
          !nonnegative(reagent.qty) ||
          reagent.qty === 0 ||
          !nonnegative(reagent.price),
      )
    )
      continue;
    recipes.push({
      recipe: {
        spellId: row.recipe.spellId,
        name: row.recipe.name,
        profession,
        skillRequired: nonnegative(row.recipe.skillRequired)
          ? row.recipe.skillRequired
          : null,
      },
      result: {
        id: row.result.id,
        name: row.result.name,
        url: itemUrl(
          row.result.url,
          `https://ahledger.com/items/${row.result.id}?market=forever/pvp/horde/us`,
        ),
        icon: itemIconUrl(row.result.icon),
      },
      resultPrice: row.resultPrice,
      cost: row.cost,
      netValue: row.netValue,
      margin: row.margin,
      resultSalesPerDay: salesEstimate(row.resultSalesPerDay),
      reagents: row.reagents.map(({ id, qty, price }) => ({ id, qty, price })),
      unpriced: [],
    });
  }
  recipes.sort(
    (a, b) => b.margin - a.margin || a.recipe.spellId - b.recipe.spellId,
  );
  return {
    profession,
    recipes,
    pricesAsOf,
    attributionUrl: itemUrl(
      data.attribution?.url,
      `https://ahledger.com/crafting?market=forever/pvp/horde/us&profession=${encodeURIComponent(profession)}`,
    ),
  };
}

export function attachCraftIcons(
  data: CraftingData,
  value: unknown,
): CraftingData {
  const ids = data.recipes.slice(0, 3).map((recipe) => recipe.result.id);
  const icons = new Map(
    parseGatheringData(value, ids).map((item) => [item.id, item.icon]),
  );
  return {
    ...data,
    recipes: data.recipes.map((recipe) => ({
      ...recipe,
      result: {
        ...recipe.result,
        icon: icons.get(recipe.result.id) ?? recipe.result.icon,
      },
    })),
  };
}

export async function fetchCraftIcons(
  data: CraftingData,
  signal: AbortSignal,
): Promise<CraftingData> {
  const ids = data.recipes.slice(0, 3).map((recipe) => recipe.result.id);
  if (!ids.length) return data;
  try {
    const response = await fetch(
      `https://api.ahledger.com/v1/tooltip/${AH_MARKET}?items=${ids.join(",")}`,
      { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) },
    );
    if (!response.ok) throw new Error("Icon lookup failed");
    return attachCraftIcons(data, await response.json());
  } catch {
    signal.throwIfAborted();
    return data;
  }
}
