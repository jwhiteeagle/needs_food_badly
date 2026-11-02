import {
  Fragment,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { foreverLink } from "../helper-modules";
import { AH_MARKET, formatMoney, type GatherItem } from "../market";
import {
  craftResultItem,
  craftReturnPercent,
  type CraftRecipe,
} from "../crafting";
import { pinKey, type PinSource, type PinnedItem } from "../pins";

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

export const PinsContext = createContext<{
  pins: PinnedItem[];
  full: boolean;
  category: string;
  setCategory: (category: string) => void;
  toggle: (pin: PinSource) => void;
  storageError: string;
  refreshError: string;
  checkedAt: number;
  retry: () => void;
} | null>(null);

// Shared item-card surface across gathering, crafting, lookup and pins
// displayName overrides labels without changing the source ID or saved item
// ids lists Wowhead links under the title, pins lists what the card can save
function ItemCard({
  item,
  displayName = item.name,
  metrics,
  icons,
  compact = false,
  heading: Heading = "h3",
  note,
  footer,
  ids,
  pins,
  lead,
}: {
  item: { id: number; name: string; icon: string | null; url: string };
  displayName?: string;
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
  ids?: { label: string; href: string }[];
  pins: { label: string; pin: PinSource }[];
  lead?: ReactNode;
}) {
  const pinning = useContext(PinsContext);
  const idLinks = ids ?? [
    { label: `ID: ${item.id}`, href: foreverLink.item(item.id) },
  ];
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
          <Heading>{displayName}</Heading>
        </a>
        <div className="market-item-ids">
          {idLinks.map(({ label, href }) => (
            <a
              key={label}
              className="market-item-id"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${displayName}, ${label}, on Wowhead`}
            >
              {label}
            </a>
          ))}
        </div>
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
        <div className="item-pin-actions">
          {pins.map(({ label, pin }) => {
            const pinned = pinning.pins.some(
              (saved) => pinKey(saved) === pinKey(pin),
            );
            return (
              <button
                key={label}
                className="item-pin-button"
                type="button"
                aria-pressed={pinned}
                aria-label={`${pinned ? "Unpin" : "Pin"} ${displayName} ${label}`}
                disabled={pinning.full && !pinned}
                onClick={() => pinning.toggle(pin)}
              >
                {pinned
                  ? `${label} pinned`
                  : pinning.full
                    ? "Pin limit reached"
                    : `Pin ${label}`}
              </button>
            );
          })}
        </div>
      )}
    </article>
  );
}

export function MarketItem({
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
  heading?: "h3" | "h4" | "h5";
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
      pins={[
        { label: "item", pin: { id: item.id, source: "tooltip", data: item } },
      ]}
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

export function useMarketFeed<T>(
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

export function CraftItem({
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
      ids={[
        {
          label: `Craft ID: ${recipe.recipe.spellId}`,
          href: foreverLink.spell(recipe.recipe.spellId),
        },
        {
          label: `Item ID: ${recipe.result.id}`,
          href: foreverLink.item(recipe.result.id),
        },
      ]}
      pins={[
        {
          label: "craft",
          pin: {
            id: recipe.result.id,
            source: "craft",
            data: recipe,
            observedAt,
            attributionUrl,
          },
        },
        {
          label: "item",
          pin: {
            id: recipe.result.id,
            source: "tooltip",
            data: craftResultItem(recipe),
          },
        },
      ]}
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
