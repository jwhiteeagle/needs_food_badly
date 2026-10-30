import {
  StrictMode,
  Fragment,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
  createContext,
} from "react";
import { createRoot } from "react-dom/client";
import { classes, colors, endings } from "./sounds";
import {
  AH_MARKET,
  GATHER_URL,
  formatMoney,
  parseGatheringData,
  type GatherItem,
  type MarketDeal,
} from "./market";
import {
  CRAFT_PROFESSIONS,
  craftingUrl,
  parseCraftingData,
  fetchCraftIcons,
  craftReturnPercent,
  type CraftRecipe,
  type CraftingData,
} from "./crafting";
import {
  PINS_STORAGE_KEY,
  parseSavedPins,
  togglePinnedItem,
  mergePinnedUpdates,
  refreshPinnedItems,
  type PinnedItem,
} from "./pins";
import rogueIcon from "./assets/wow/rogue.jpg" with { type: "file" };
import warriorIcon from "./assets/wow/warrior.jpg" with { type: "file" };
import mageIcon from "./assets/wow/mage.jpg" with { type: "file" };
import paladinIcon from "./assets/wow/paladin.jpg" with { type: "file" };
import shamanIcon from "./assets/wow/shaman.jpg" with { type: "file" };
import warlockIcon from "./assets/wow/warlock.jpg" with { type: "file" };
import priestIcon from "./assets/wow/priest.jpg" with { type: "file" };
import druidIcon from "./assets/wow/druid.jpg" with { type: "file" };
import hunterIcon from "./assets/wow/hunter.jpg" with { type: "file" };

// Extra silence between clips, in milliseconds. Tune here without changing assets.
const CLIP_GAP_MS = 0;

// Classic class colors; game icons sourced from wow.zamimg.com and bundled locally.
const wowClasses = {
  rogue: { label: "Rogue", color: "#FFF569", icon: rogueIcon },
  warrior: { label: "Warrior", color: "#C79C6E", icon: warriorIcon },
  mage: { label: "Mage", color: "#69CCF0", icon: mageIcon },
  paladin: { label: "Paladin", color: "#F58CBA", icon: paladinIcon },
  shaman: { label: "Shaman", color: "#0070DE", icon: shamanIcon },
  warlock: { label: "Warlock", color: "#9482C9", icon: warlockIcon },
  priest: { label: "Priest", color: "#FFFFFF", icon: priestIcon },
  druid: { label: "Druid", color: "#FF7D0A", icon: druidIcon },
  hunter: { label: "Hunter", color: "#ABD473", icon: hunterIcon },
};

// Add one object per person; pair each plain-text name with a reusable class entry.
const reservations: {
  name: string;
  characters: {
    name: string;
    wowClass: (typeof wowClasses)[keyof typeof wowClasses];
    featured?: boolean;
  }[];
}[] = [
  {
    name: "Gunnar",
    characters: [
      { name: "Green Archer", wowClass: wowClasses.hunter, featured: true },
      { name: "Green Wizard", wowClass: wowClasses.warlock },
    ],
  },
  {
    name: "Jake",
    characters: [
      { name: "Green Warrior", wowClass: wowClasses.warrior },
      { name: "Red Minotaur", wowClass: wowClasses.druid },
      { name: "Green Scout", wowClass: wowClasses.hunter },
    ],
  },
  {
    name: "Josh",
    characters: [
      { name: "Pink Cavalier", wowClass: wowClasses.paladin, featured: true },
      { name: "Blue Defender", wowClass: wowClasses.shaman },
      { name: "Red Mongrel", wowClass: wowClasses.druid },
    ],
  },
  {
    name: "Paul",
    characters: [
      { name: "Apox Apox", wowClass: wowClasses.hunter, featured: true },
      { name: "Apocks Apawks", wowClass: wowClasses.rogue },
      { name: "Aphax Apaewux", wowClass: wowClasses.druid },
    ],
  },
  {
    name: "Dirk",
    characters: [
      { name: "Dirka Dirka", wowClass: wowClasses.druid, featured: true },
      { name: "Undecided Main", wowClass: wowClasses.paladin },
      { name: "Notmuch Timetoplay", wowClass: wowClasses.warrior },
    ],
  },
];

const ICONS: Record<string, string> = {
  sword:
    "M11 1h4v4h-2v2h-2v2H9v2H7v2H5v2H1v-4h2V9h2V7h2V5h2V3h2z M1 5h2v2h2v2h2v2h2v2H7v-2H5V9H3V7H1z",
  shield: "M2 1h12v9h-2v2h-2v2H6v-2H4v-2H2z M7 3v8h2V3z",
  magic: "M7 1h2v2h2v4h2v4h2v3H1v-3h2V7h2V3h2z M5 9v2h6V9z M8 4v2h2V4z",
  bow: "M3 1h4v2h2v2h2v6H9v2H7v2H3v-2h4v-2h2V5H7V3H3z M3 3h2v10H3z M7 7h6V5h2v6h-2V9H7z",
  jester:
    "M1 2h4v2h2V1h2v3h2V2h4v5h-2V5h-2v4h2v4h-2v2H5v-2H3V9h2V5H3v2H1z M5 9v2h2V9z M9 9v2h2V9z",
  beast:
    "M1 1h3v4h8V1h3v8h-2v4h-2v2H5v-2H3V9H1z M4 7v2h2V7z M10 7v2h2V7z M6 11v2h4v-2z",
  food: "M8 1h4v2H9v2h4v2h2v6h-2v2H3v-2H1V7h2V5h4V3h1z M4 7v2h2V7z",
  feast: "M8 1h5v2h2v5h-2v2H8V8H6V6h2z M5 7h2v2l-3 3v2H1v-3h2z",
  skull:
    "M4 1h8v2h2v8h-2v4H4v-4H2V3h2z M4 5v4h3V5z M9 5v4h3V5z M7 10v2h2v-2z M5 13v2h2v-2z M9 13v2h2v-2z",
  play: "M4 1h2v2h2v2h2v2h2v2h-2v2H8v2H6v2H4z",
  stop: "M3 3h10v10H3z",
};

function PixelIcon({ name }: { name: string }) {
  return (
    <svg
      className="pixel-icon"
      viewBox="0 0 16 16"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path d={ICONS[name]} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

type Player = {
  context: AudioContext;
  buffers: Map<string, Promise<AudioBuffer>>;
  sources: AudioBufferSourceNode[];
};

function Price({ value, icons }: { value: number | null; icons: boolean }) {
  if (value === null) return "—";
  const currencies: Record<string, string> = {
    g: "gold",
    s: "silver",
    c: "copper",
  };
  return (
    <span className="money">
      {formatMoney(value)
        .split(" ")
        .map((part) => {
          const unit = part.slice(-1);
          return (
            <span
              className="money-denomination"
              data-currency={unit}
              key={unit}
            >
              {part.slice(0, -1)}
              {icons ? (
                <span className="money-coin" aria-hidden="true" />
              ) : (
                <span className="money-label" aria-hidden="true">
                  {unit}
                </span>
              )}
              <span className="sr-only"> {currencies[unit]} </span>
            </span>
          );
        })}
    </span>
  );
}

const PinsContext = createContext<{
  pins: PinnedItem[];
  toggle: (pin: PinnedItem) => void;
  storageError: string;
  refreshError: string;
  checkedAt: number;
  retry: () => void;
} | null>(null);

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
  const selection = saved.pins
    .map(
      (pin) =>
        `${pin.source}:${pin.id}${pin.source === "craft" ? `:${pin.data.recipe.spellId}` : ""}`,
    )
    .join(",");

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
        toggle: (pin) => commit(togglePinnedItem(latest.current, pin)),
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

// Endpoint-specific views supply rows; this component owns every item card surface.
function ItemCard({
  item,
  metrics,
  icons,
  compact = false,
  heading: Heading = "h3",
  note,
  footer,
  pin,
  lead,
}: {
  item: { id: number; name: string; icon: string | null; url: string };
  metrics: {
    label: string;
    value: number | null;
    format: "money" | "number";
    fallback?: string;
  }[];
  icons: boolean;
  compact?: boolean;
  heading?: "h3" | "h4" | "h5";
  note?: string;
  footer?: ReactNode;
  pin: PinnedItem;
  lead?: ReactNode;
}) {
  const pinning = useContext(PinsContext);
  const pinned = pinning?.pins.some((saved) => saved.id === pin.id) ?? false;
  return (
    <article
      className={compact ? "market-item market-item-compact" : "market-item"}
    >
      <div className="market-item-title">
        <a
          className="market-item-heading"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.icon && (
            <img
              src={item.icon}
              alt=""
              width="32"
              height="32"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
          )}
          <Heading>{item.name}</Heading>
        </a>
        <a
          className="market-item-id"
          href={`https://www.wowhead.com/forever/item=${item.id}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${item.name}, item ${item.id}, on Wowhead`}
        >
          ID: {item.id}
        </a>
      </div>
      {note && <p className="market-card-note">{note}</p>}
      {lead}
      <dl>
        {metrics.map(({ label, value, format, fallback = "—" }) => (
          <Fragment key={label}>
            <dt>{label}</dt>
            <dd data-negative={value !== null && value < 0}>
              {format === "money" ? (
                <Price value={value} icons={icons} />
              ) : (
                (value?.toLocaleString() ?? fallback)
              )}
            </dd>
          </Fragment>
        ))}
      </dl>
      {footer}
      {pinning && (
        <button
          className="item-pin-button"
          type="button"
          aria-pressed={pinned}
          aria-label={`${pinned ? "Unpin" : "Pin"} ${item.name}`}
          onClick={() => pinning.toggle(pin)}
        >
          {pinned ? "Pinned" : "Pin item"}
        </button>
      )}
    </article>
  );
}

function MarketCardSection({
  title,
  headingId,
  description,
  loading,
  empty,
  error,
  onRetry,
  loadingText,
  emptyText,
  footer,
  children,
  heading: Heading = "h3",
  headerIcon,
  gridClassName = "",
  headerHref,
}: {
  title: string;
  headingId?: string;
  description?: string;
  loading: boolean;
  empty: boolean;
  error: string;
  onRetry: () => void;
  loadingText: string;
  emptyText: string;
  footer?: ReactNode;
  children: ReactNode;
  heading?: "h3" | "h4";
  headerIcon?: string;
  gridClassName?: string;
  headerHref?: string;
}) {
  const iconTitle = (
    <>
      <img src={headerIcon} alt="" width="32" height="32" loading="lazy" />
      {title}
    </>
  );
  return (
    <section
      className={
        headingId
          ? `market-card-section market-card-section-headed${headerIcon ? " profession-section" : ""}`
          : "market-card-section"
      }
      aria-labelledby={headingId}
      aria-label={headingId ? undefined : title}
    >
      {headingId &&
        (headerIcon ? (
          <header className="market-item profession-divider">
            <Heading id={headingId}>
              {headerHref ? (
                <a
                  className="profession-link"
                  href={headerHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {iconTitle}
                </a>
              ) : (
                iconTitle
              )}
            </Heading>
          </header>
        ) : (
          <Heading id={headingId}>{title}</Heading>
        ))}
      {description && <p className="section-subheading">{description}</p>}
      {error && (
        <p className="market-error" role="status">
          {error}{" "}
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        </p>
      )}
      {loading && !error && (
        <p className="market-message" role="status">
          {loadingText}
        </p>
      )}
      {empty && <p className="market-message">{emptyText}</p>}
      <div className={`market-grid ${gridClassName}`.trim()}>{children}</div>
      {footer}
    </section>
  );
}

function MarketItem({
  item,
  icons,
  checkedAt,
  compact = false,
  heading = "h3",
}: {
  item: GatherItem;
  icons: boolean;
  checkedAt: number;
  compact?: boolean;
  heading?: "h3" | "h4";
}) {
  const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const observed = item.observedAt ? new Date(item.observedAt) : null;
  const old = observed && checkedAt - observed.getTime() > 86400000;
  return (
    <ItemCard
      item={{
        ...item,
        url: `https://ahledger.com/items/${item.id}-${slug}/${AH_MARKET}`,
      }}
      metrics={[
        { label: "Median", value: item.median, format: "money" },
        { label: "Lowest buyout", value: item.minBuyout, format: "money" },
        { label: "Listed units", value: item.quantity, format: "number" },
        {
          label: "Sold/day",
          value: item.salesPerDay,
          format: "number",
          fallback: "-",
        },
      ]}
      icons={icons}
      compact={compact}
      heading={heading}
      pin={{ id: item.id, source: "tooltip", data: item }}
      footer={
        <p className="market-observed" data-stale={Boolean(old)}>
          {observed ? (
            <>
              {old ? "Beta scan · " : "Scanned "}
              <time dateTime={item.observedAt!}>
                {observed.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
            </>
          ) : item.median === null &&
            item.minBuyout === null &&
            item.quantity === null ? (
            "No scans available for this item on PvP Horde US."
          ) : (
            "No scan timestamp"
          )}
        </p>
      }
    />
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

function useMarketFeed<T>(
  url: string,
  parse: (value: unknown) => T,
  enrich?: (data: T, signal: AbortSignal) => Promise<T>,
  onLoad?: (data: T, checkedAt: number) => void,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [checkedAt, setCheckedAt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let pending = false;
    async function load() {
      if (pending || document.hidden) return;
      pending = true;
      try {
        // Default HTTP caching honors AHledger's Cache-Control; no keys or proxy.
        const signal = AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(15000),
        ]);
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error("Market request failed");
        const parsed = parse(await response.json());
        const next = enrich ? await enrich(parsed, controller.signal) : parsed;
        if (active) {
          const now = Date.now();
          setData(next);
          setCheckedAt(now);
          setError("");
          onLoad?.(next, now);
        }
      } catch {
        if (active)
          setError(
            "Couldn't refresh data. Previous scan data, if shown, is unchanged.",
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
  }, [url, parse, enrich, onLoad, attempt]);

  return {
    data,
    error,
    checkedAt,
    retry: () => setAttempt((value) => value + 1),
  };
}

function DealItem({
  deal,
  icons,
  observedAt,
  attributionUrl,
  checkedAt,
  showScan = false,
}: {
  deal: MarketDeal;
  icons: boolean;
  observedAt: string | null;
  attributionUrl: string;
  checkedAt: number;
  showScan?: boolean;
}) {
  const observed = observedAt ? new Date(observedAt) : null;
  const old = observed && checkedAt - observed.getTime() > 86400000;
  return (
    <ItemCard
      item={deal.item}
      heading="h4"
      metrics={[
        { label: "Lowest buyout", value: deal.minBuyout, format: "money" },
        { label: "30-day median", value: deal.median30d, format: "money" },
        { label: "Listed units", value: deal.quantity, format: "number" },
        {
          label: "Sold/day",
          value: deal.salesPerDay,
          format: "number",
          fallback: "-",
        },
      ]}
      icons={icons}
      note={
        deal.discount === null
          ? "Discount unavailable"
          : deal.discount === 0
            ? "At or above 30-day median"
            : `${Math.round(deal.discount * 100)}% below 30-day median`
      }
      pin={{
        id: deal.item.id,
        source: "deal",
        data: deal,
        observedAt,
        attributionUrl,
      }}
      footer={
        showScan ? (
          <p className="market-observed" data-stale={Boolean(old)}>
            {observed ? (
              <>
                {old ? "Beta scan · " : "Scanned "}
                <time dateTime={observedAt!}>{observed.toLocaleString()}</time>
              </>
            ) : (
              "No scans available for this item on PvP Horde US."
            )}
            {" · "}
            <a href={attributionUrl} target="_blank" rel="noopener noreferrer">
              AHledger
            </a>
          </p>
        ) : undefined
      }
    />
  );
}

function PinnedItems({ icons }: { icons: boolean }) {
  const pinning = useContext(PinsContext)!;
  return (
    <MarketCardSection
      title="Pinned Items"
      headingId="pinned-items-heading"
      gridClassName="pinned-grid"
      description="Pin favorites from any item card. Saved in this browser."
      loading={false}
      empty={false}
      error={pinning.pins.length ? pinning.refreshError : ""}
      onRetry={pinning.retry}
      loadingText=""
      emptyText=""
      footer={
        <>
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
      {pinning.pins.map((pin) =>
        pin.source === "tooltip" ? (
          <MarketItem
            key={pin.id}
            item={pin.data}
            icons={icons}
            checkedAt={pinning.checkedAt}
            heading="h4"
          />
        ) : pin.source === "deal" ? (
          <DealItem
            key={pin.id}
            deal={pin.data}
            icons={icons}
            checkedAt={pinning.checkedAt}
            observedAt={pin.observedAt}
            attributionUrl={pin.attributionUrl}
            showScan
          />
        ) : (
          <CraftItem
            key={pin.id}
            recipe={pin.data}
            icons={icons}
            checkedAt={pinning.checkedAt}
            observedAt={pin.observedAt}
            attributionUrl={pin.attributionUrl}
            heading="h4"
            showScan
          />
        ),
      )}
      {Array.from(
        { length: Math.max(0, 3 - pinning.pins.length) },
        (_, index) => (
          <div className="market-item pin-placeholder" key={index}>
            <span aria-hidden="true">＋</span>
            <p>Pin a favorite</p>
            <small>Use Pin item on any card below</small>
          </div>
        ),
      )}
    </MarketCardSection>
  );
}

function CraftItem({
  recipe,
  icons,
  observedAt,
  attributionUrl,
  checkedAt,
  heading = "h5",
  showScan = false,
}: {
  recipe: CraftRecipe;
  icons: boolean;
  observedAt: string | null;
  attributionUrl: string;
  checkedAt: number;
  heading?: "h4" | "h5";
  showScan?: boolean;
}) {
  const observed = observedAt ? new Date(observedAt) : null;
  const old = observed && checkedAt - observed.getTime() > 86400000;
  const percent = craftReturnPercent(recipe);
  return (
    <ItemCard
      item={recipe.result}
      heading={heading}
      icons={icons}
      metrics={[
        { label: "Margin / craft", value: recipe.margin, format: "money" },
        { label: "Reagent cost", value: recipe.cost, format: "money" },
        { label: "Net sale value", value: recipe.netValue, format: "money" },
      ]}
      note={
        recipe.recipe.skillRequired === null
          ? undefined
          : `Skill ${recipe.recipe.skillRequired}`
      }
      lead={
        <>
          <p
            className="craft-return"
            data-direction={
              percent === null || percent === 0
                ? "flat"
                : percent > 0
                  ? "profit"
                  : "loss"
            }
            title={
              percent === null
                ? "Return unavailable when reagent cost is zero"
                : "Net profit divided by reagent cost"
            }
          >
            {percent === null ? (
              "Return —"
            ) : (
              <>
                <span aria-hidden="true">
                  {percent > 0 ? "▲" : percent < 0 ? "▼" : "→"}
                </span>
                <span>
                  {percent > 0 ? "+" : ""}
                  {percent.toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                  })}
                  %
                </span>
                <span className="sr-only"> return on reagent cost</span>
              </>
            )}
          </p>
          <dl
            className="craft-sales"
            title="Estimated units of the crafted item sold per day"
          >
            <dt>Sold/day</dt>
            <dd>{recipe.resultSalesPerDay?.toLocaleString() ?? "-"}</dd>
          </dl>
        </>
      }
      pin={{
        id: recipe.result.id,
        source: "craft",
        data: recipe,
        observedAt,
        attributionUrl,
      }}
      footer={
        showScan ? (
          <p className="market-observed" data-stale={Boolean(old)}>
            {observed ? (
              <>
                {old ? "Beta scan · " : "Scanned "}
                <time dateTime={observedAt!}>{observed.toLocaleString()}</time>
              </>
            ) : (
              "No scan timestamp"
            )}
            {" · "}
            <a href={attributionUrl} target="_blank" rel="noopener noreferrer">
              AHledger
            </a>
          </p>
        ) : undefined
      }
    />
  );
}

type CraftScan = {
  observedAt: string | null;
  checkedAt: number;
  attributionUrl: string;
};

function ProfessionCrafts({
  profession,
  icons,
  onScan,
}: {
  profession: (typeof CRAFT_PROFESSIONS)[number];
  icons: boolean;
  onScan: (profession: string, scan: CraftScan) => void;
}) {
  const parse = useCallback(
    (value: unknown) => parseCraftingData(value, profession.name),
    [profession.name],
  );
  const reportScan = useCallback(
    (data: CraftingData, checkedAt: number) => {
      onScan(profession.name, {
        observedAt: data.pricesAsOf,
        checkedAt,
        attributionUrl: data.attributionUrl,
      });
    },
    [profession.name, onScan],
  );
  const { data, error, checkedAt, retry } = useMarketFeed(
    craftingUrl(profession.name),
    parse,
    fetchCraftIcons,
    reportScan,
  );
  return (
    <MarketCardSection
      title={profession.name}
      headingId={`craft-${profession.name.toLowerCase().replaceAll(" ", "-")}`}
      heading="h4"
      headerIcon={profession.icon}
      headerHref={
        data?.attributionUrl ??
        `https://ahledger.com/crafting?market=forever/pvp/horde/us&profession=${encodeURIComponent(profession.name)}`
      }
      gridClassName="profession-cards"
      loading={!data}
      empty={data?.recipes.length === 0}
      error={error}
      onRetry={retry}
      loadingText="Loading recipes..."
      emptyText="No fully priced recipes available."
    >
      {data?.recipes.slice(0, 3).map((recipe) => (
        <CraftItem
          key={recipe.recipe.spellId}
          recipe={recipe}
          icons={icons}
          observedAt={data!.pricesAsOf}
          attributionUrl={data!.attributionUrl}
          checkedAt={checkedAt}
        />
      ))}
    </MarketCardSection>
  );
}

function ProfessionCraftMargins({ icons }: { icons: boolean }) {
  const [scans, setScans] = useState<Record<string, CraftScan>>({});
  const onScan = useCallback((profession: string, scan: CraftScan) => {
    setScans((previous) => ({ ...previous, [profession]: scan }));
  }, []);
  const received = Object.values(scans);
  const times = received.flatMap((scan) =>
    scan.observedAt ? [new Date(scan.observedAt).getTime()] : [],
  );
  const first = times.length ? new Date(Math.min(...times)) : null;
  const last = times.length ? new Date(Math.max(...times)) : null;
  const old = received.some(
    (scan) =>
      scan.observedAt &&
      scan.checkedAt - new Date(scan.observedAt).getTime() > 86400000,
  );
  const source = new URL(
    received[0]?.attributionUrl ??
      "https://ahledger.com/crafting?market=forever/pvp/horde/us",
  );
  source.searchParams.delete("profession");
  return (
    <section
      className="market-card-section-headed"
      aria-labelledby="craft-margins-heading"
    >
      <h3 id="craft-margins-heading">Profession Craft Margins</h3>
      <p className="section-subheading">Top 3 calculated craft recipes</p>
      <p
        className="market-observed market-source craft-summary"
        data-stale={Boolean(old)}
      >
        {first && (
          <>
            {old ? "Beta scan" : "Scanned"}{" "}
            <time dateTime={first.toISOString()}>
              {first.toLocaleDateString()}
            </time>
            {last &&
            last.toLocaleDateString() !== first.toLocaleDateString() ? (
              <>
                {" "}
                -{" "}
                <time dateTime={last.toISOString()}>
                  {last.toLocaleDateString()}
                </time>
              </>
            ) : null}
            {" · "}
          </>
        )}
        <a href={source.href} target="_blank" rel="noopener noreferrer">
          Prices from AHledger
        </a>
      </p>
      <div className="profession-list">
        {CRAFT_PROFESSIONS.map((profession) => (
          <ProfessionCrafts
            key={profession.name}
            profession={profession}
            icons={icons}
            onScan={onScan}
          />
        ))}
      </div>
    </section>
  );
}

function GatheringWatchlist() {
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
          <MarketCardSection
            title="Gathering Watchlist"
            headingId="gathering-prices-heading"
            loading={!items}
            empty={items?.length === 0}
            error={error}
            onRetry={retry}
            loadingText="Loading market scans..."
            emptyText="No scans available for these items on PvP Horde US."
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
          </MarketCardSection>
        </div>
      </section>
    </PinnedItemsProvider>
  );
}

function App() {
  const [colorIndex, setColorIndex] = useState(0);
  const [classIndex, setClassIndex] = useState(0);
  const [endingIndex, setEndingIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState("");
  const audio = useRef<Player | null>(null);
  const color = colors[colorIndex]!;
  const character = classes[classIndex]!;
  const ending = endings[endingIndex]!;
  const phrase = `${color.label} ${character.label} ${ending.label}`;

  useEffect(
    () => () => {
      const player = audio.current;
      audio.current = null;
      if (player) void player.context.close();
    },
    [],
  );

  async function play() {
    if (status === "loading") return;
    if (status === "playing") {
      for (const source of audio.current!.sources) {
        source.stop();
        source.disconnect();
      }
      audio.current!.sources = [];
      setStatus("idle");
      return;
    }

    setError("");
    setStatus("loading");
    try {
      // Create/resume inside the click gesture for mobile autoplay policies.
      const player = (audio.current ??= {
        context: new AudioContext(),
        buffers: new Map(),
        sources: [],
      });
      await player.context.resume();
      const buffers = await Promise.all(
        [color, character, ending].map(({ url }) => {
          let pending = player.buffers.get(url);
          if (!pending) {
            // Cache decoded audio for this page session; failed loads remain retryable.
            pending = fetch(url, { signal: AbortSignal.timeout(15000) })
              .then((response) => {
                if (!response.ok) throw new Error("Sound could not be loaded");
                return response.arrayBuffer();
              })
              .then((bytes) => player.context.decodeAudioData(bytes))
              .catch((error) => {
                player.buffers.delete(url);
                throw error;
              });
            player.buffers.set(url, pending);
          }
          return pending;
        }),
      );
      if (audio.current !== player) return;

      // One audio clock avoids the drift of timers or chaining HTML audio events.
      let when = player.context.currentTime + 0.03;
      player.sources = buffers.map((buffer) => {
        const source = player.context.createBufferSource();
        source.buffer = buffer;
        source.connect(player.context.destination);
        source.addEventListener(
          "ended",
          () => {
            source.disconnect();
            if (player.sources.at(-1) === source && audio.current === player) {
              player.sources = [];
              setStatus("idle");
            }
          },
          { once: true },
        );
        source.start(when);
        when += buffer.duration + CLIP_GAP_MS / 1000;
        return source;
      });
      setStatus("playing");
    } catch {
      setError("Couldn't play that line. Tap play to try again.");
      setStatus("idle");
    }
  }

  return (
    <main className="soundboard">
      <header className="phrase-header">
        <div
          className="title-crest"
          data-color={color.swatch}
          aria-hidden="true"
        >
          <PixelIcon name={character.icon} />
        </div>
        <h1 aria-live="polite" aria-atomic="true">
          <span data-color={color.swatch}>{color.label}</span> {character.label}
          <span className="phrase-ending">{"<Needs Food Badly>"}</span>
        </h1>
      </header>

      <div className="widget-grid">
        <section
          className="reservations"
          aria-labelledby="reservations-heading"
        >
          <header className="section-header reservations-header">
            <h2 id="reservations-heading">Confirmed Character Reservations</h2>
            <p className="section-subheading">
              <strong>Planned Mains in Bold</strong>
            </p>
          </header>
          <div className="reservation-grid">
            {reservations.map(({ name, characters }) => (
              <article key={name}>
                <h3>{name}</h3>
                <ul>
                  {characters.map(({ name, wowClass, featured }) => (
                    <li
                      key={name}
                      className={featured ? "reservation-featured" : undefined}
                    >
                      {name} -{" "}
                      <span
                        className="wow-class"
                        style={{ color: wowClass.color }}
                      >
                        <img
                          src={wowClass.icon}
                          alt=""
                          width="16"
                          height="16"
                        />
                        {wowClass.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section
          className="playback-section"
          aria-labelledby="playback-heading"
        >
          <h2 id="playback-heading" className="playback-heading">
            &quot;{phrase}&quot;
          </h2>
          <fieldset disabled={status !== "idle"}>
            <legend>Color</legend>
            <div className="color-grid">
              {colors.map((choice, index) => (
                <button
                  key={choice.label}
                  type="button"
                  className="choice color-choice"
                  data-color={choice.swatch}
                  aria-pressed={index === colorIndex}
                  onClick={() => setColorIndex(index)}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset disabled={status !== "idle"}>
            <legend>Class</legend>
            <div className="class-grid">
              {classes.map((choice, index) => (
                <button
                  key={choice.label}
                  type="button"
                  className="choice class-choice"
                  aria-pressed={index === classIndex}
                  onClick={() => setClassIndex(index)}
                >
                  <PixelIcon name={choice.icon} />
                  <span>{choice.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset disabled={status !== "idle"}>
            <legend>Voice line</legend>
            <div className="ending-grid">
              {endings.map((choice, index) => (
                <button
                  key={choice.label}
                  type="button"
                  className="choice ending-choice"
                  aria-pressed={index === endingIndex}
                  onClick={() => setEndingIndex(index)}
                >
                  <PixelIcon name={choice.icon} />
                  <span>{choice.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <footer className="playback">
            {error && (
              <p className="playback-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="play-button"
              type="button"
              disabled={status === "loading"}
              aria-label={
                status === "playing" ? "Stop playback" : `Play ${phrase}`
              }
              onClick={() => void play()}
            >
              <PixelIcon name={status === "playing" ? "stop" : "play"} />
              {status === "loading"
                ? "Loading..."
                : status === "playing"
                  ? "Stop playback"
                  : "Play voice line"}
            </button>
          </footer>
        </section>
      </div>
      <GatheringWatchlist />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
