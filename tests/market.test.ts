import { expect, test } from "bun:test";
import { formatMoney, parseGatheringData, itemIconUrl } from "../src/market";

const item = {
  id: 2450,
  name: "Briarthorn",
  icon: null,
  median: 695,
  minBuyout: 677,
  quantity: 2575,
  observedAt: "2026-10-21T16:25:06.000Z",
  salesPerDay: null,
};
const response = (items: unknown[]) => ({
  market: { slug: "forever/pvp/horde/us" },
  items,
});

test("rejects another ruleset, faction, region, or game instead of relabeling it", () => {
  for (const slug of [
    "forever/normal/horde/us",
    "forever/pvp/alliance/us",
    "forever/pvp/horde/eu",
    "retail/pvp/horde/us",
  ]) {
    expect(() =>
      parseGatheringData({ market: { slug }, items: [item] }),
    ).toThrow("Unexpected market");
  }
});

test("keeps unavailable values distinct from actual zero values", () => {
  const [unknown] = parseGatheringData(
    response([
      {
        ...item,
        median: null,
        minBuyout: null,
        quantity: null,
        observedAt: null,
      },
    ]),
  );
  expect(unknown?.median).toBeNull();
  expect(unknown?.quantity).toBeNull();
  expect(formatMoney(unknown!.median)).toBe("—");
  expect(formatMoney(0)).toBe("0c");
  expect(formatMoney(10695)).toBe("1g 6s 95c");
});

test("reads optional sold/day estimates while retaining zero and treating empty values as unknown", () => {
  for (const [value, expected] of [
    [undefined, null],
    [null, null],
    ["", null],
    [0, 0],
    [12.5, 12.5],
    [-1, null],
    [NaN, null],
    ["12", null],
  ] as const) {
    const parsed = parseGatheringData(
      response([{ ...item, salesPerDay: value }]),
    );
    expect(parsed[0]?.salesPerDay).toBe(expected);
  }
});

test("rejects corrupt prices and timestamps", () => {
  for (const change of [
    { median: -1 },
    { median: "695" },
    { quantity: NaN },
    { observedAt: "not a date" },
  ]) {
    expect(() =>
      parseGatheringData(response([{ ...item, ...change }])),
    ).toThrow("Invalid item data");
  }
});

test("drops unwatched items and unapproved icon hosts", () => {
  const items = parseGatheringData(
    response([
      { ...item, id: 99999 },
      { ...item, icon: "https://unrelated.example/icon.jpg" },
    ]),
  );
  expect(items).toHaveLength(1);
  expect(items[0]?.id).toBe(2450);
  expect(items[0]?.icon).toBeNull();
  expect(itemIconUrl("https://ahledger.com/icons/4554334.jpg")).toBe(
    "https://ahledger.com/icons/4554334.jpg",
  );
  expect(
    itemIconUrl("https://ahledger.com.evil.test/icons/4554334.jpg"),
  ).toBeNull();
  expect(itemIconUrl("https://ahledger.com/other/4554334.jpg")).toBeNull();
});

test("looks up a requested item outside the watchlist without accepting other items", () => {
  const lookupItem = { ...item, id: 2447, name: "Peacebloom" };
  const data = response([item, lookupItem]);
  expect(parseGatheringData(data, [2447])).toEqual([lookupItem]);
  expect(parseGatheringData(response([]), [2447])).toEqual([]);
  expect(() =>
    parseGatheringData(
      { ...data, market: { slug: "forever/pvp/alliance/us" } },
      [2447],
    ),
  ).toThrow("Unexpected market");
});
