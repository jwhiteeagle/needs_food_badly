import {
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AH_MARKET,
  GATHER_URL,
  parseGatheringData,
  type GatherItem,
} from "../market";
import {
  DEFAULT_GROUP,
  MAX_GROUP_LENGTH,
  MAX_PINS,
  PINS_STORAGE_KEY,
  groupPins,
  mergePinnedUpdates,
  pinKey,
  parseSavedPins,
  refreshPinnedItems,
  togglePinnedItem,
  type PinnedItem,
} from "../pins";
import { Widget } from "../widget";
import { CraftItem, MarketItem, PinsContext, useMarketFeed } from "./cards";
import { ProfessionCraftMargins } from "./craft-margins";

function PinnedItemsProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState(() => {
    try {
      return {
        pins: parseSavedPins(localStorage.getItem(PINS_STORAGE_KEY)),
        storageError: "",
      };
    } catch {
      return {
        pins: [] as PinnedItem[],
        storageError:
          "Browser storage is unavailable. Pins will last for this visit only.",
      };
    }
  });
  const latest = useRef(saved.pins);
  const [refreshError, setRefreshError] = useState("");
  const [checkedAt, setCheckedAt] = useState(() => Date.now());
  const [attempt, setAttempt] = useState(0);
  const [category, setCategory] = useState("");
  const selection = saved.pins.map(pinKey).join(",");

  const commit = useCallback((pins: PinnedItem[]) => {
    let storageError = "";
    try {
      localStorage.setItem(
        PINS_STORAGE_KEY,
        JSON.stringify({ market: AH_MARKET, items: pins }),
      );
    } catch {
      storageError =
        "Couldn't save pins in this browser. Changes will last for this visit only.";
    }
    latest.current = pins;
    setSaved({ pins, storageError });
  }, []);

  useEffect(() => {
    if (!selection) return;
    const controller = new AbortController();
    let active = true;
    let pending = false;
    async function load() {
      if (pending || document.hidden) return;
      pending = true;
      try {
        const result = await refreshPinnedItems(
          latest.current,
          controller.signal,
        );
        if (active) {
          commit(mergePinnedUpdates(latest.current, result.pins));
          setCheckedAt(Date.now());
          setRefreshError(
            result.failed
              ? "Some pinned items couldn't refresh. Their saved scan data is still shown."
              : "",
          );
        }
      } catch {
        if (active)
          setRefreshError(
            "Couldn't refresh pinned items. Saved scan data is still shown.",
          );
      } finally {
        pending = false;
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 10 * 60 * 1000);
    const onVisible = () => {
      if (!document.hidden) void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [selection, attempt, commit]);

  return (
    <PinsContext
      value={{
        pins: saved.pins,
        full: saved.pins.length >= MAX_PINS,
        category,
        setCategory,
        toggle: (pin) =>
          commit(togglePinnedItem(latest.current, pin, category)),
        storageError: saved.storageError,
        refreshError,
        checkedAt,
        retry: () => setAttempt((value) => value + 1),
      }}
    >
      {children}
    </PinsContext>
  );
}

function ItemLookup({ icons }: { icons: boolean }) {
  const [itemId, setItemId] = useState("");
  const [result, setResult] = useState<{
    item: GatherItem;
    checkedAt: number;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  async function lookup() {
    request.current?.abort();
    const id = Number(itemId.trim());
    setResult(null);
    if (
      !/^[0-9]+$/.test(itemId.trim()) ||
      !Number.isSafeInteger(id) ||
      id < 1
    ) {
      setMessage("Enter a valid numeric item ID, such as 2447.");
      setPending(false);
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(
        `https://api.ahledger.com/v1/tooltip/${AH_MARKET}?items=${id}`,
        {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(15000),
          ]),
        },
      );
      if (!response.ok) throw new Error("Lookup failed");
      const [item] = parseGatheringData(await response.json(), [id]);
      if (controller.signal.aborted) return;
      if (item) setResult({ item, checkedAt: Date.now() });
      else
        setMessage(
          `No item data found for ID ${id} in AHledger's Forever catalog.`,
        );
    } catch {
      if (!controller.signal.aborted)
        setMessage("Couldn't look up that item. Try again.");
    } finally {
      if (!controller.signal.aborted) setPending(false);
    }
  }

  return (
    <div className="item-lookup">
      <form
        className="item-lookup-form"
        onSubmit={(event) => {
          event.preventDefault();
          void lookup();
        }}
      >
        <label htmlFor="market-item-id">Item ID</label>
        <input
          id="market-item-id"
          type="text"
          inputMode="numeric"
          pattern="[0-9]+"
          required
          placeholder="e.g. 2447"
          value={itemId}
          onChange={(event) => setItemId(event.target.value)}
        />
        <button type="submit" disabled={pending}>
          {pending ? "Looking…" : "Look up"}
        </button>
      </form>
      <div aria-live="polite" aria-busy={pending}>
        {message && <p className="market-message">{message}</p>}
        {result && (
          <MarketItem
            item={result.item}
            checkedAt={result.checkedAt}
            icons={icons}
            compact
          />
        )}
      </div>
    </div>
  );
}

// Cards pin into the category typed here; groups follow each category's first pin
function PinnedItems({ icons }: { icons: boolean }) {
  const pinning = useContext(PinsContext)!;
  const groups = groupPins(pinning.pins);
  return (
    <Widget
      title="Pinned Items"
      headingId="pinned-items-heading"
      description={
        <>
          Want to finally afford your own epic mount? Look up items by entering
          the ID below and pin them for later.
          <br />
          Pin favorites from any of my pre-constructed item cards below.
        </>
      }
      toolbar={
        <>
          <label htmlFor="pin-category">Pin new items to</label>
          <input
            id="pin-category"
            type="text"
            list="pin-categories"
            maxLength={MAX_GROUP_LENGTH}
            placeholder={DEFAULT_GROUP}
            value={pinning.category}
            onChange={(event) => pinning.setCategory(event.target.value)}
          />
          <datalist id="pin-categories">
            {groups.map(({ name }) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {pinning.pins.length > 0 && (
            <span>
              {pinning.pins.length} / {MAX_PINS} pinned
            </span>
          )}
        </>
      }
      feed={{
        error: pinning.pins.length ? pinning.refreshError : "",
        onRetry: pinning.retry,
      }}
      groups={groups.map(({ name, pins }) => ({
        title: name,
        items: pins.map((pin) =>
          pin.source === "tooltip" ? (
            <MarketItem
              key={pinKey(pin)}
              item={pin.data}
              icons={icons}
              checkedAt={pinning.checkedAt}
              heading="h5"
            />
          ) : (
            <CraftItem
              key={pinKey(pin)}
              recipe={pin.data}
              icons={icons}
              checkedAt={pinning.checkedAt}
              observedAt={pin.observedAt}
              attributionUrl={pin.attributionUrl}
              heading="h5"
              showScan
            />
          ),
        ),
      }))}
      footer={
        <>
          {pinning.full && (
            <p className="market-message">
              Pin limit reached. Unpin an item to add another.
            </p>
          )}
          {pinning.storageError && (
            <p className="market-error" role="status">
              {pinning.storageError}
            </p>
          )}
          {pinning.pins.length > 0 && (
            <p className="market-attribution">
              <a
                href="https://ahledger.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Prices from AHledger
              </a>
            </p>
          )}
        </>
      }
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div className="market-item pin-placeholder" key={index}>
          <span aria-hidden="true">＋</span>
          <p>Pin a favorite</p>
          <small>Use Pin item on any card below</small>
        </div>
      ))}
    </Widget>
  );
}

export function PricingData() {
  const {
    data: items,
    error,
    checkedAt,
    retry,
  } = useMarketFeed(GATHER_URL, parseGatheringData);
  const [showCoinIcons, setShowCoinIcons] = useState(true);

  return (
    <PinnedItemsProvider>
      <section className="experiments" aria-labelledby="gathering-heading">
        <header className="section-header">
          <h2 id="gathering-heading">Cute Pricing Data</h2>
          <p className="section-subheading">
            US PvP Horde - Click item ID to jump to wowhead link
          </p>
          <p className="section-subheading">Live data populates after Launch</p>
          <label className="coin-toggle">
            <input
              type="checkbox"
              checked={showCoinIcons}
              onChange={(event) => setShowCoinIcons(event.target.checked)}
            />
            Currency Icons
          </label>
        </header>
        <PinnedItems icons={showCoinIcons} />
        <ItemLookup icons={showCoinIcons} />
        <div className="widget-grid">
          <ProfessionCraftMargins icons={showCoinIcons} />
          <hr className="widget-divider" />
          <Widget
            title="Gathering Watchlist"
            headingId="gathering-prices-heading"
            feed={{
              error,
              onRetry: retry,
              loading: !items,
              loadingText: "Loading market scans...",
              empty: items?.length === 0,
              emptyText: "No scans available for these items on PvP Horde US.",
            }}
            footer={
              <p className="market-attribution">
                <a
                  href="https://ahledger.com/guides/gold/meta#gather"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Prices from AHledger
                </a>
              </p>
            }
          >
            {items?.map((item) => (
              <MarketItem
                key={item.id}
                item={item}
                icons={showCoinIcons}
                checkedAt={checkedAt}
                heading="h4"
              />
            ))}
          </Widget>
        </div>
      </section>
    </PinnedItemsProvider>
  );
}
