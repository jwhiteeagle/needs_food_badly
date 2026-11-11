import { useCallback, useState } from "react";
import {
  CRAFT_PROFESSIONS,
  craftingUrl,
  fetchCraftIcons,
  parseCraftingData,
  type CraftingData,
} from "../crafting";
import { FeedStatus } from "../widget";
import { CraftItem, useMarketFeed } from "./cards";

type CraftScan = {
  observedAt: string | null;
  checkedAt: number;
  attributionUrl: string;
};

// One profession header and its ranked cards stay together as a grid item
function ProfessionBlock({
  profession,
  onScan,
}: {
  profession: (typeof CRAFT_PROFESSIONS)[number];
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
  const headingId = `craft-${profession.name.toLowerCase().replaceAll(" ", "-")}`;
  // Icon-linked header and card-block width ceiling make this a profession-only shape
  return (
    <section
      className="market-card-section-headed card-block profession-block"
      aria-labelledby={headingId}
    >
      <header className="market-item profession-divider">
        <h4 id={headingId}>
          <a
            className="profession-link"
            href={
              data?.attributionUrl ??
              `https://ahledger.com/crafting?market=forever/pvp/horde/us&profession=${encodeURIComponent(profession.name)}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={profession.icon}
              alt=""
              width="32"
              height="32"
              loading="lazy"
            />
            {profession.name}
          </a>
        </h4>
      </header>
      <FeedStatus
        error={error}
        onRetry={retry}
        loading={!data}
        loadingText="Loading recipes..."
        empty={data?.recipes.length === 0}
        emptyText="No fully priced recipes available."
      />
      <div className="market-grid profession-cards">
        {data?.recipes.slice(0, 3).map((recipe) => (
          <CraftItem
            key={recipe.recipe.spellId}
            recipe={recipe}
            observedAt={data!.pricesAsOf}
            attributionUrl={data!.attributionUrl}
            checkedAt={checkedAt}
          />
        ))}
      </div>
    </section>
  );
}

export function ProfessionCraftMargins() {
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
      className="market-card-section-headed craft-margins"
      aria-labelledby="craft-margins-heading"
    >
      <header className="craft-margins-header">
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
      </header>
      <div className="profession-grid">
        {CRAFT_PROFESSIONS.map((profession) => (
          <ProfessionBlock
            key={profession.name}
            profession={profession}
            onScan={onScan}
          />
        ))}
      </div>
    </section>
  );
}
