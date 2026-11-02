import { useState } from "react";
import { classicLink } from "./helper-modules";
import { classIdentities, tierOneIdentities } from "./horde-sprites/assets";
import { dungeonOneIdentities } from "./horde-sprites/dungeon-one";
import { dungeonTwoIdentities } from "./horde-sprites/dungeon-two";
import { pvpEpicIdentities, pvpRareIdentities } from "./horde-sprites/pvp";
import { tierThreeIdentities } from "./horde-sprites/tier-three";
import type { SpriteCatalog } from "./horde-sprites/types";
import warriorIcon from "./assets/wow/warrior.jpg" with { type: "file" };
import hunterIcon from "./assets/wow/hunter.jpg" with { type: "file" };
import rogueIcon from "./assets/wow/rogue.jpg" with { type: "file" };
import shamanIcon from "./assets/wow/shaman.jpg" with { type: "file" };
import warlockIcon from "./assets/wow/warlock.jpg" with { type: "file" };
import mageIcon from "./assets/wow/mage.jpg" with { type: "file" };
import priestIcon from "./assets/wow/priest.jpg" with { type: "file" };
import paladinIcon from "./assets/wow/paladin.jpg" with { type: "file" };
import druidIcon from "./assets/wow/druid.jpg" with { type: "file" };
import dungeonOneArtwork from "./assets/wow/tiers/dungeon_set_1_artwork.webp" with { type: "file" };
import dungeonTwoArtwork from "./assets/wow/tiers/dungeon_set_2_artwork.webp" with { type: "file" };
import pvpRareArtwork from "./assets/wow/tiers/pvp_rare_artwork.webp" with { type: "file" };
import pvpEpicArtwork from "./assets/wow/tiers/pvp_epic_artwork.webp" with { type: "file" };
import raidOneArtwork from "./assets/wow/tiers/raid_tier_1_artwork.webp" with { type: "file" };
import raidTwoArtwork from "./assets/wow/tiers/raid_tier_2_artwork.webp" with { type: "file" };
import raidThreeArtwork from "./assets/wow/tiers/raid_tier_3_artwork.webp" with { type: "file" };

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
const classColors: Record<string, string> = {
  Warrior: "#C79C6E",
  Hunter: "#ABD473",
  Rogue: "#FFF569",
  Shaman: "#0070DE",
  Warlock: "#9482C9",
  Mage: "#69CCF0",
  Priest: "#FFFFFF",
  Paladin: "#F58CBA",
  Druid: "#FF7D0A",
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

type GallerySprite = SpriteCatalog["items"][number] & {
  atlas: string;
  columns: number;
  groupLabel: string;
};

// Framed journal art: https://wow.zamimg.com/images/wow/journal/ui-ej-lorebg-<location>.png
// Alpha padding trimmed, whole frame resized to 256px square; PvP uses visual stand-ins
const tierArtwork = {
  "dungeon-set-1": {
    src: dungeonOneArtwork,
    location: "Scholomance",
    source: "scholomance",
    fileDataId: 608254,
  },
  "dungeon-set-2": {
    src: dungeonTwoArtwork,
    location: "Blackrock Depths",
    source: "blackrockdepths",
    fileDataId: 608235,
  },
  "pvp-rare": {
    src: pvpRareArtwork,
    location: "Dire Maul",
    source: "diremaul",
    fileDataId: 608239,
  },
  "pvp-epic": {
    src: pvpEpicArtwork,
    location: "Utgarde Pinnacle",
    source: "utgardepinnacle",
    fileDataId: 608266,
  },
  "raid-tier-1": {
    src: raidOneArtwork,
    location: "Molten Core",
    source: "moltencore",
    fileDataId: 1396505,
  },
  "raid-tier-2": {
    src: raidTwoArtwork,
    location: "Blackwing Lair",
    source: "blackwinglair",
    fileDataId: 1396499,
  },
  "raid-tier-3": {
    src: raidThreeArtwork,
    location: "Naxxramas",
    source: "naxxramas",
    fileDataId: 1396506,
  },
};

function ShowAllIcon() {
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
  .horde-sprites__set-name {
    font-weight: 700;
  }
  .horde-sprites__weapons {
    display: grid;
    gap: 0.15rem;
  }
  .horde-sprites__identities {
    margin-top: 1.1rem;
    border-top: 1px solid rgb(198 216 146 / 0.18);
    padding-top: 0.8rem;
  }
  #sprite-browser {
    scroll-margin-top: 1rem;
  }
  .horde-sprites__tirekickers {
    margin-top: 1.1rem;
  }
  .horde-sprites__main-heading,
  .horde-sprites__tirekickers-heading {
    margin: 0 0 0.4rem;
    color: var(--foreground);
    text-align: center;
    font-size: 1rem;
    font-weight: 650;
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  .horde-sprites__main-heading {
    font-size: 1.25rem;
  }
  .horde-sprites__main-description {
    margin: 0 0 0.6rem;
    text-align: center;
    font-size: 0.9rem;
    line-height: 1.3;
    text-wrap: balance;
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
    background-color: rgb(198 216 146 / 0.15);
    box-shadow: inset 0 0 0 1px var(--selected);
  }
  .horde-sprites__show-all {
    width: auto;
    margin-left: 0.35rem;
    padding-inline: 0.85rem;
  }
  .horde-sprites__tier-button {
    position: relative;
    width: 5rem;
    height: 5rem;
    padding: 0.4rem;
    border: 0;
    border-radius: 0;
    background-color: transparent;
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }
  .horde-sprites__tier-button::before {
    content: "";
    position: absolute;
    inset: 0.4rem;
    background: rgb(0 0 0 / 0.3);
    pointer-events: none;
  }
  .horde-sprites__tier-button:hover,
  .horde-sprites__tier-button[aria-pressed="true"],
  .horde-sprites__tier-button:focus-visible {
    outline: 2px solid var(--selected);
    outline-offset: 1px;
    box-shadow: none;
  }
  .horde-sprites__tier-button span {
    position: relative;
    align-self: center;
    color: white;
    font-size: 0.8rem;
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    text-wrap: balance;
    text-shadow: -1px -1px 1px black, 1px -1px 1px black,
      -1px 1px 1px black, 1px 1px 1px black, 0 2px 4px black;
  }
  .horde-sprites__all-tiers {
    width: 5rem;
    height: 5rem;
    margin-left: 0;
    grid-template-rows: 1fr auto;
    padding: 0.65rem;
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
  .horde-sprites__gallery-description {
    margin: 0 0 0.85rem;
    text-align: center;
    font-size: 1rem;
    line-height: 1.3;
    text-wrap: balance;
  }
  .horde-sprites__identities > details > summary {
    width: fit-content;
    max-width: 100%;
    min-height: 48px;
    margin-inline: auto;
    margin-bottom: 0.4rem;
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
  .horde-sprites__identities > details > summary::marker {
    color: var(--selected);
  }
  .horde-sprites__identities > details > summary:hover,
  .horde-sprites__identities > details > summary:focus-visible {
    border-color: var(--selected);
    background: rgb(198 216 146 / 0.15);
  }
  .horde-sprites__set-name,
  .horde-sprites__weapon {
    color: inherit;
    text-decoration: none;
    overflow-wrap: anywhere;
  }
  .horde-sprites__set-name[href]:hover,
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

// Missing catalog IDs remain readable text. Sets and items have separate ID spaces
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
          characterClass,
          set,
          weapons,
          column,
          atlas,
          columns,
          groupLabel,
        }) => (
          <li key={id}>
            <figure className="horde-sprites__figure">
              <Sprite column={column} atlas={atlas} columns={columns} />
              <figcaption className="horde-sprites__caption">
                <strong style={{ color: classColors[characterClass] }}>
                  {byClass ? groupLabel : characterClass}
                </strong>
                {set.setId === null ? (
                  <span className="horde-sprites__set-name">
                    {set.displayName}
                  </span>
                ) : (
                  <a
                    className="horde-sprites__set-name"
                    href={classicLink.set(set.setId)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {set.displayName}
                  </a>
                )}
                <span className="horde-sprites__weapons">
                  {weapons.map(({ displayName, itemId }, index) =>
                    itemId === null ? (
                      <span key={`prop-${index}`}>{displayName}</span>
                    ) : (
                      <a
                        key={`${itemId}-${index}`}
                        className="horde-sprites__weapon"
                        href={classicLink.item(itemId)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {displayName}
                      </a>
                    ),
                  )}
                </span>
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
        Main Characters - "Capital G Gamers"
      </h2>
      <p className="horde-sprites__main-description">
        <em>
          Planning on playing a &quot;lot&quot;? Reach out to Jake with a sprite
          request to be added.
        </em>
      </p>
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
          Tirekickers - "I dunno man, I'll prob check it out."
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
      <div className="horde-sprites__identities">
        <p className="horde-sprites__gallery-description">
          Cool sprites wearing the gear you wish you had. Clickable wowhead
          links for sets and weapons.
        </p>
        <details id="sprite-browser" open>
          <summary>Expand To View More Horde Sprites</summary>
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
                        title={`${label} · ${tierArtwork[id].location} artwork`}
                        style={{
                          backgroundImage: `url("${tierArtwork[id].src}")`,
                        }}
                        aria-controls="sprite-viewer-content"
                        aria-pressed={selectedTier === id}
                        onClick={() => setSelectedTier(id)}
                      >
                        <span>{label}</span>
                      </button>
                    ))}
                <button
                  className={`horde-sprites__filter-button horde-sprites__show-all${displayFormat === "set" ? " horde-sprites__all-tiers" : ""}`}
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
                  {displayFormat === "set" && <ShowAllIcon />}
                  <span>Show all</span>
                </button>
              </div>
            </div>
            <div
              id="sprite-viewer-content"
              className="horde-sprites__viewer-content"
              role="region"
              aria-label={
                displayFormat === "class"
                  ? "Sprites by class"
                  : "Sprites by tier"
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
      </div>
    </section>
  );
}
