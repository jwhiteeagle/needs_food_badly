import { useState } from "react";
import { classIdentities, tierOneIdentities } from "./horde-sprites/assets";
import { dungeonOneIdentities } from "./horde-sprites/dungeon-one";
import { dungeonTwoIdentities } from "./horde-sprites/dungeon-two";
import { pvpEpicIdentities, pvpRareIdentities } from "./horde-sprites/pvp";
import { tierThreeIdentities } from "./horde-sprites/tier-three";
import warriorIcon from "./assets/wow/warrior.jpg" with { type: "file" };
import hunterIcon from "./assets/wow/hunter.jpg" with { type: "file" };
import rogueIcon from "./assets/wow/rogue.jpg" with { type: "file" };
import shamanIcon from "./assets/wow/shaman.jpg" with { type: "file" };
import warlockIcon from "./assets/wow/warlock.jpg" with { type: "file" };
import mageIcon from "./assets/wow/mage.jpg" with { type: "file" };
import priestIcon from "./assets/wow/priest.jpg" with { type: "file" };
import paladinIcon from "./assets/wow/paladin.jpg" with { type: "file" };
import druidIcon from "./assets/wow/druid.jpg" with { type: "file" };
import scholomanceIcon from "./assets/wow/tiers/scholomance.jpg" with { type: "file" };
import blackrockDepthsIcon from "./assets/wow/tiers/blackrock-depths.jpg" with { type: "file" };
import moltenCoreIcon from "./assets/wow/tiers/molten-core.jpg" with { type: "file" };
import blackwingLairIcon from "./assets/wow/tiers/blackwing-lair.jpg" with { type: "file" };
import naxxramasIcon from "./assets/wow/tiers/naxxramas.jpg" with { type: "file" };
import hordePvpIcon from "./assets/wow/tiers/horde-pvp.jpg" with { type: "file" };

const spriteSize = classIdentities.displaySize;
const classIcons = {
  Warrior: warriorIcon,
  Hunter: hunterIcon,
  Rogue: rogueIcon,
  Shaman: shamanIcon,
  Warlock: warlockIcon,
  Mage: mageIcon,
  Priest: priestIcon,
  Paladin: paladinIcon,
  Druid: druidIcon,
};

const spriteSets = [
  { id: "raid-tier-3", label: "Raid Tier 3", collection: tierThreeIdentities },
  { id: "raid-tier-2", label: "Raid Tier 2", collection: classIdentities },
  { id: "raid-tier-1", label: "Raid Tier 1", collection: tierOneIdentities },
  { id: "pvp-epic", label: "PvP Epic (Horde)", collection: pvpEpicIdentities },
  { id: "pvp-rare", label: "PvP Rare (Horde)", collection: pvpRareIdentities },
  {
    id: "dungeon-set-2",
    label: "Dungeon Tier 2",
    collection: dungeonTwoIdentities,
  },
  {
    id: "dungeon-set-1",
    label: "Dungeon Tier 1",
    collection: dungeonOneIdentities,
  },
] as const;

const setGroups = spriteSets.map(({ id, label, collection }) => ({
  id,
  label,
  items: collection.items.map((item) => ({
    ...item,
    atlas: collection.src,
    columns: collection.columns,
    groupLabel: label,
  })),
}));

const tierGroups = [...setGroups].reverse();

type GallerySprite = (typeof setGroups)[number]["items"][number];

// WoW icons from https://wow.zamimg.com/images/wow/icons/large/.
// Achievement IDs retain the source association; comments retain icon filenames.
const tierIcons = {
  "dungeon-set-1": scholomanceIcon, // 645: spell_holy_senseundead
  "dungeon-set-2": blackrockDepthsIcon, // 642: achievement_boss_emperordagranthaurissan
  "pvp-rare": hordePvpIcon, // 619: inv_bannerpvp_01
  "pvp-epic": hordePvpIcon,
  "raid-tier-1": moltenCoreIcon, // 686: achievement_boss_ragnaros
  "raid-tier-2": blackwingLairIcon, // 685: achievement_boss_nefarion
  "raid-tier-3": naxxramasIcon, // 576: achievement_dungeon_naxxramas_normal
};

function TierIcon({ id }: { id: keyof typeof tierIcons | "all" }) {
  if (id !== "all") {
    return <img src={tierIcons[id]} alt="" width="28" height="28" />;
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const classGroups = classIdentities.items.map(({ characterClass }) => ({
  id: `class-${characterClass.toLowerCase()}`,
  label: characterClass,
  // Dungeon Tiers 1 and 2, PvP Rare, PvP Epic, then Raid Tiers 1, 2, and 3.
  items: [...setGroups]
    .reverse()
    .flatMap(({ items }) =>
      items.filter((item) => item.characterClass === characterClass),
    ),
}));

// Manual names, classes, and sets for the featured characters.
// Keep this independent of reservations; repeated class sprites are intentional.
const characterDisplays = [
  {
    displayName: "Red Minotaur",
    characterClass: "Druid",
    color: "#FF7D0A",
    setId: "raid-tier-2",
  },
  {
    displayName: "Green Wizard",
    characterClass: "Mage",
    color: "#69CCF0",
    setId: "pvp-epic",
  },
  {
    displayName: "Green Warrior",
    characterClass: "Warrior",
    color: "#C79C6E",
    setId: "raid-tier-2",
  },
  {
    displayName: "Green Archer",
    characterClass: "Hunter",
    color: "#ABD473",
    setId: "raid-tier-1",
  },
  {
    displayName: "Pink Cavalier",
    characterClass: "Paladin",
    color: "#F58CBA",
    setId: "raid-tier-2",
  },
  {
    displayName: "Apox Apox",
    characterClass: "Hunter",
    color: "#ABD473",
    setId: "raid-tier-2",
  },
  {
    displayName: "Trolger Allaboutcrit",
    characterClass: "Hunter",
    color: "#ABD473",
    setId: "dungeon-set-1",
  },
  {
    displayName: "Excedrine Allaboutcrit",
    characterClass: "Priest",
    color: "#FFFFFF",
    setId: "dungeon-set-1",
  },
] as const;

// Manual class assignments, in the same order as the current tirekicker list.
const tirekickerClasses = [
  "Druid",
  "Mage",
  "Druid",
  "Rogue",
  "Shaman",
  "Warlock",
  "Mage",
  "Mage",
] as const;

// Feature selectors stay local; identity colors and fonts come from shared tokens
const styles = `
  .horde-sprites {
    width: 100%;
    min-width: 0;
    margin-top: 0.75rem;
    border-top: 1px solid rgb(198 216 146 / 0.18);
    padding-top: 0.75rem;
    font-family: var(--font-sans);
    color: var(--foreground);
  }
  .horde-sprites__lineup {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem 1.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .horde-sprites__figure {
    width: ${spriteSize + 4}px;
    max-width: 100%;
    margin: 0;
    text-align: center;
  }
  .horde-sprites__sprite {
    display: block;
    width: ${spriteSize}px;
    height: ${spriteSize}px;
    margin-inline: auto;
    background-image: url("${classIdentities.src}");
    background-size: ${spriteSize * classIdentities.columns}px ${spriteSize}px;
    background-repeat: no-repeat;
    image-rendering: pixelated;
  }
  .horde-sprites__caption {
    display: grid;
    gap: 0.15rem;
    color: var(--muted);
    font-size: 0.72rem;
    font-weight: 400;
    line-height: 1.2;
  }
  .horde-sprites__caption strong {
    color: var(--foreground);
    font-size: 0.85rem;
  }
  .horde-sprites__identities {
    margin-top: 1.1rem;
    border-top: 1px solid rgb(198 216 146 / 0.18);
    padding-top: 0.8rem;
  }
  .horde-sprites__tirekickers {
    margin-top: 1.1rem;
  }
  .horde-sprites__main-heading,
  .horde-sprites__tirekickers-heading {
    margin: 0 0 0.4rem;
    color: var(--muted);
    text-align: center;
    font-size: 0.9rem;
    font-weight: 650;
  }
  .horde-sprites__main-heading {
    font-size: 1.125rem;
  }
  .horde-sprites__tirekicker-lineup {
    gap: 0.25rem 0.5rem;
  }
  .horde-sprites__class-lineup {
    gap: 1rem 0.75rem;
  }
  .horde-sprites__display {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin: 0;
    color: var(--muted);
    font-size: 0.9rem;
  }
  .horde-sprites__display select {
    max-width: 100%;
    border: 1px solid rgb(198 216 146 / 0.3);
    border-radius: 0.4rem;
    padding: 0.4rem 0.7rem;
    background: var(--card);
    color: var(--foreground);
    font: inherit;
    cursor: pointer;
  }
  .horde-sprites__viewer {
    border: 1px solid rgb(198 216 146 / 0.25);
    border-radius: 0.65rem;
    background: var(--background);
  }
  .horde-sprites__viewer-toolbar {
    padding: 0.8rem 0.75rem;
    border-bottom: 1px solid rgb(198 216 146 / 0.18);
  }
  .horde-sprites__filter-nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.35rem;
    margin-top: 0.75rem;
  }
  .horde-sprites__filter-button {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    padding: 6px;
    border: 1px solid var(--border);
    border-radius: 0.3rem;
    background: var(--card);
    color: var(--foreground);
    font-size: 0.85rem;
    font-weight: 650;
  }
  .horde-sprites__filter-button img {
    width: 28px;
    height: 28px;
  }
  .horde-sprites__filter-button:hover,
  .horde-sprites__filter-button[aria-pressed="true"] {
    border-color: var(--selected);
    background: rgb(198 216 146 / 0.15);
    box-shadow: inset 0 0 0 1px var(--selected);
  }
  .horde-sprites__show-all {
    width: auto;
    margin-left: 0.35rem;
    padding-inline: 0.85rem;
  }
  .horde-sprites__tier-button {
    width: 6.5rem;
    height: auto;
    min-height: 4.75rem;
    grid-template-rows: 28px 1fr;
    gap: 0.3rem;
    padding: 0.5rem;
  }
  .horde-sprites__tier-button span {
    font-size: 0.75rem;
    line-height: 1.2;
    text-align: center;
    text-wrap: balance;
  }
  .horde-sprites__viewer-content {
    padding: 0.75rem;
  }
  .horde-sprites__group {
    min-width: 0;
    border: 1px solid rgb(198 216 146 / 0.22);
    border-radius: 0.65rem;
    padding: 1rem 0.75rem 1.2rem;
    background: rgb(198 216 146 / 0.025);
  }
  .horde-sprites__group + .horde-sprites__group {
    margin-top: 1rem;
  }
  .horde-sprites__group-heading {
    margin: 0 0 0.85rem;
    text-align: center;
    font-size: 1.125rem;
    font-weight: 650;
  }
  .horde-sprites__identities > summary {
    width: fit-content;
    max-width: 100%;
    min-height: 48px;
    margin-inline: auto;
    margin-bottom: 1rem;
    border: 1px solid rgb(198 216 146 / 0.5);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgb(198 216 146 / 0.08);
    color: var(--selected);
    text-align: center;
    font-size: 1.125rem;
    font-weight: 650;
    line-height: 1.3;
    list-style-position: inside;
    cursor: pointer;
    touch-action: manipulation;
  }
  .horde-sprites__identities > summary::marker {
    color: var(--selected);
  }
  .horde-sprites__identities > summary:hover,
  .horde-sprites__identities > summary:focus-visible {
    border-color: var(--selected);
    background: rgb(198 216 146 / 0.15);
  }
  .horde-sprites__weapon {
    color: inherit;
    text-decoration: none;
    overflow-wrap: anywhere;
  }
  .horde-sprites__weapon:hover {
    color: var(--foreground);
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }
`;

function Sprite({
  column,
  atlas = classIdentities.src,
  columns = classIdentities.columns,
  size = spriteSize,
  label,
}: {
  column: number;
  atlas?: string;
  columns?: number;
  size?: number;
  label?: string;
}) {
  return (
    <span
      className="horde-sprites__sprite"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{
        width: size,
        height: size,
        backgroundImage: `url("${atlas}")`,
        backgroundSize: `${size * columns}px ${size}px`,
        backgroundPositionX: -column * size,
      }}
    />
  );
}

function SpriteLineup({
  items,
  byClass,
}: {
  items: readonly GallerySprite[];
  byClass: boolean;
}) {
  return (
    <ul className="horde-sprites__lineup horde-sprites__class-lineup">
      {items.map(
        ({
          id,
          race,
          characterClass,
          set,
          weapon,
          weaponUrl,
          column,
          atlas,
          columns,
          groupLabel,
        }) => (
          <li key={id}>
            <figure className="horde-sprites__figure">
              <Sprite column={column} atlas={atlas} columns={columns} />
              <figcaption className="horde-sprites__caption">
                <strong>{byClass ? groupLabel : characterClass}</strong>
                <span>
                  {race} · {set}
                </span>
                <a
                  className="horde-sprites__weapon"
                  href={weaponUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {weapon}
                </a>
              </figcaption>
            </figure>
          </li>
        ),
      )}
    </ul>
  );
}

function FeaturedCharacter({
  displayName,
  characterClass,
  color,
  setId,
}: (typeof characterDisplays)[number]) {
  const sprite = setGroups
    .find(({ id }) => id === setId)
    ?.items.find((item) => item.characterClass === characterClass);

  if (!sprite) return null;

  return (
    <figure className="horde-sprites__figure">
      <Sprite
        column={sprite.column}
        atlas={sprite.atlas}
        columns={sprite.columns}
      />
      <figcaption className="horde-sprites__caption">
        <strong style={{ color }}>{displayName}</strong>
        <span>{"<Needs Food Badly>"}</span>
      </figcaption>
    </figure>
  );
}

export function HordeSprites() {
  const [displayFormat, setDisplayFormat] = useState<"set" | "class">("set");
  const [selectedClass, setSelectedClass] = useState(classGroups[0]!.id);
  const [selectedTier, setSelectedTier] = useState<string>(tierGroups[0]!.id);
  const groups =
    displayFormat === "set"
      ? tierGroups.filter(
          ({ id }) => selectedTier === "all" || id === selectedTier,
        )
      : classGroups.filter(
          ({ id }) => selectedClass === "all" || id === selectedClass,
        );

  return (
    <section className="horde-sprites" aria-label="Horde adventurers">
      <style>{styles}</style>
      <h2 id="main-characters-heading" className="horde-sprites__main-heading">
        Main Characters
      </h2>
      <ul
        className="horde-sprites__lineup"
        aria-labelledby="main-characters-heading"
      >
        {characterDisplays.map((character) => (
          <li key={character.displayName}>
            <FeaturedCharacter {...character} />
          </li>
        ))}
      </ul>
      <section
        className="horde-sprites__tirekickers"
        aria-labelledby="tirekickers-sprites-heading"
      >
        <h2
          id="tirekickers-sprites-heading"
          className="horde-sprites__tirekickers-heading"
        >
          Tirekickers
        </h2>
        <ul className="horde-sprites__lineup horde-sprites__tirekicker-lineup">
          {tirekickerClasses.map((characterClass, index) => {
            const sprite = classIdentities.items.find(
              (item) => item.characterClass === characterClass,
            );
            return sprite ? (
              <li key={`${characterClass}-${index}`}>
                <Sprite
                  column={sprite.column}
                  size={spriteSize / 2}
                  label={`${characterClass} tirekicker`}
                />
              </li>
            ) : null;
          })}
        </ul>
      </section>
      <details className="horde-sprites__identities" open>
        <summary>Classic Era Class Sprites</summary>
        <div className="horde-sprites__viewer">
          <div className="horde-sprites__viewer-toolbar">
            <label className="horde-sprites__display">
              Display sprites by
              <select
                value={displayFormat}
                onChange={(event) => {
                  setDisplayFormat(
                    event.currentTarget.value === "class" ? "class" : "set",
                  );
                  setSelectedClass(classGroups[0]!.id);
                  setSelectedTier(tierGroups[0]!.id);
                }}
              >
                <option value="set">Tier</option>
                <option value="class">Class</option>
              </select>
            </label>
            <div
              className="horde-sprites__filter-nav"
              role="group"
              aria-label={
                displayFormat === "class"
                  ? "Filter sprites by class"
                  : "Filter sprites by tier"
              }
            >
              {displayFormat === "class"
                ? classGroups.map(({ id, label }) => (
                    <button
                      key={id}
                      className="horde-sprites__filter-button"
                      type="button"
                      title={label}
                      aria-label={`Show ${label} sprites`}
                      aria-controls="sprite-viewer-content"
                      aria-pressed={selectedClass === id}
                      onClick={() => setSelectedClass(id)}
                    >
                      <img
                        src={classIcons[label]}
                        alt=""
                        width="28"
                        height="28"
                      />
                    </button>
                  ))
                : tierGroups.map(({ id, label }) => (
                    <button
                      key={id}
                      className="horde-sprites__filter-button horde-sprites__tier-button"
                      type="button"
                      aria-controls="sprite-viewer-content"
                      aria-pressed={selectedTier === id}
                      onClick={() => setSelectedTier(id)}
                    >
                      <TierIcon id={id} />
                      <span>{label}</span>
                    </button>
                  ))}
              <button
                className={`horde-sprites__filter-button horde-sprites__show-all${displayFormat === "set" ? " horde-sprites__tier-button" : ""}`}
                type="button"
                aria-controls="sprite-viewer-content"
                aria-pressed={
                  displayFormat === "class"
                    ? selectedClass === "all"
                    : selectedTier === "all"
                }
                onClick={() =>
                  displayFormat === "class"
                    ? setSelectedClass("all")
                    : setSelectedTier("all")
                }
              >
                {displayFormat === "set" && <TierIcon id="all" />}
                <span>Show all</span>
              </button>
            </div>
          </div>
          <div
            id="sprite-viewer-content"
            className="horde-sprites__viewer-content"
            role="region"
            aria-label={
              displayFormat === "class" ? "Sprites by class" : "Sprites by tier"
            }
          >
            {groups.map(({ id, label, items }) => (
              <section
                key={id}
                id={`sprite-group-${id}`}
                className="horde-sprites__group"
                aria-labelledby={`sprites-${id}`}
              >
                <h2
                  id={`sprites-${id}`}
                  className="horde-sprites__group-heading"
                >
                  {label}
                </h2>
                <SpriteLineup
                  items={items}
                  byClass={displayFormat === "class"}
                />
              </section>
            ))}
          </div>
        </div>
      </details>
    </section>
  );
}
