import { afterAll, afterEach, expect, spyOn, test } from "bun:test";
import { AHLEDGER_KEY_STORAGE, ahLedgerFetch } from "../src/ahledger-client";

const storageDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "localStorage",
);
const fetchSpy = spyOn(globalThis, "fetch");
const url =
  "https://api.ahledger.com/v1/tooltip/forever.pvp.horde.us?items=2447";

afterAll(() => fetchSpy.mockRestore());

function browserStorage(read: (name: string) => string | null) {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: read },
  });
  fetchSpy.mockResolvedValue(new Response("{}"));
}

afterEach(() => {
  fetchSpy.mockClear();
  if (storageDescriptor)
    Object.defineProperty(globalThis, "localStorage", storageDescriptor);
  else Reflect.deleteProperty(globalThis, "localStorage");
});

test("uses the current saved key and preserves cancellation and caller headers", async () => {
  let key: string | null = "ahlk_test_only";
  browserStorage((name) => (name === AHLEDGER_KEY_STORAGE ? key : null));
  const controller = new AbortController();
  await ahLedgerFetch(url, {
    signal: controller.signal,
    headers: { Accept: "application/json" },
  });
  const options = fetchSpy.mock.calls[0]![1]!;
  expect(new Headers(options.headers).get("Authorization")).toBe(
    "Bearer ahlk_test_only",
  );
  expect(new Headers(options.headers).get("Accept")).toBe("application/json");
  expect(options.signal).toBe(controller.signal);
  expect(options.redirect).toBe("error");

  key = null;
  await ahLedgerFetch(url);
  expect(
    new Headers(fetchSpy.mock.calls[1]![1]!.headers).has("Authorization"),
  ).toBe(false);
});

test("public requests work when browser storage is blocked", async () => {
  browserStorage(() => {
    throw new Error("Storage blocked");
  });
  await ahLedgerFetch(url);
  expect(
    new Headers(fetchSpy.mock.calls[0]![1]!.headers).has("Authorization"),
  ).toBe(false);
});

test("rejects other origins before reading or sending a saved key", () => {
  let reads = 0;
  browserStorage(() => {
    reads += 1;
    return "ahlk_test_only";
  });
  for (const target of [
    "https://example.com",
    "https://api.ahledger.com.example.com",
    "http://api.ahledger.com",
    "https://ahledger.com",
  ]) {
    expect(() => ahLedgerFetch(target)).toThrow("API origin");
  }
  expect(reads).toBe(0);
  expect(fetchSpy).not.toHaveBeenCalled();
});
