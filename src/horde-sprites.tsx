import { useState } from "react";
import { classicLink } from "./helper-modules";
import {
  characterClasses,
  professions,
  tierArtwork,
  type CharacterClass,
  type ProfessionName,
} from "./identity-and-icons";
import { classIdentities, tierOneIdentities } from "./horde-sprites/assets";
import { dungeonOneIdentities } from "./horde-sprites/dungeon-one";
import { dungeonTwoIdentities } from "./horde-sprites/dungeon-two";
import { pvpEpicIdentities, pvpRareIdentities } from "./horde-sprites/pvp";
import { tierThreeIdentities } from "./horde-sprites/tier-three";
import type { SpriteCatalog } from "./horde-sprites/types";
import omarSprite from "./horde-sprites/dungeon_set_1/256/warrior_protection_tauren_dungeon_set_1_256.png" with { type: "file" };
import karenSprite from "./horde-sprites/dungeon_set_2/256/warlock_undead_female_dungeon_set_2_256.png" with { type: "file" };

const spriteSize = classIdentities.displaySize;

const spriteSets = [
  { id: "raid-tier-3", label: "Raid Tier 3", collection: tierThreeIdentities },
  { id: "raid-tier-2", label: "Raid Tier 2", collection: classIdentities },
  { id: "raid-tier-1", label: "Raid Tier 1", collection: tierOneIdentities },
  { id: "pvp-epic", label: "PvP Epic (Horde)", collection: pvpEpicIdentities },
  { id: "pvp-rare", label: "PvP Rare (Horde)", collection: pvpRareIdentities },
  {
    id: "dungeon-tier-2",
    label: "Dungeon Tier 2",
    collection: dungeonTwoIdentities,
  },
  {
    id: "dungeon-tier-1",
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

const classGroups = (Object.keys(characterClasses) as CharacterClass[]).map(
  (characterClass) => ({
    id: `class-${characterClass.toLowerCase()}`,
    label: characterClass,
    // Dungeon Tiers 1 and 2, PvP Rare, PvP Epic, then Raid Tiers 1, 2, and 3.
    items: [...setGroups]
      .reverse()
      .flatMap(({ items }) =>
        items.filter((item) => item.characterClass === characterClass),
      ),
  }),
);

type CharacterDisplay = {
  displayName: string;
  characterClass: CharacterClass;
  setId: (typeof spriteSets)[number]["id"];
  // Optional standalone variant; shared gallery atlases stay unchanged
  spriteSrc?: string;
  professions?:
    | readonly []
    | readonly [ProfessionName]
    | readonly [ProfessionName, ProfessionName]
    | readonly [ProfessionName, ProfessionName, ProfessionName]
    | readonly [ProfessionName, ProfessionName, ProfessionName, ProfessionName];
};

// Manual character assignments; omit professions or use an empty list for none
const characterDisplays = [
  {
    displayName: "Green Rogue",
    characterClass: "Rogue",
    setId: "dungeon-tier-1",
    professions: ["Leatherworking", "Skinning", "Cooking"],
  },
  {
    displayName: "Gray Witch",
    characterClass: "Priest",
    setId: "raid-tier-2",
    professions: ["Tailoring", "Enchanting"],
  },
  {
    displayName: "Omars Cominyall",
    characterClass: "Warrior",
    setId: "dungeon-tier-1",
    spriteSrc: omarSprite,
    professions: ["Mining", "Engineering"],
  },
  {
    displayName: "Pink Cavalier",
    characterClass: "Paladin",
    setId: "raid-tier-2",
    professions: ["Mining", "Blacksmithing", "Cooking", "Fishing"],
  },
  {
    displayName: "Green Archer",
    characterClass: "Hunter",
    setId: "raid-tier-1",
    professions: ["Leatherworking", "Skinning"],
  },
  {
    displayName: "Apoc Ulypse",
    characterClass: "Hunter",
    setId: "raid-tier-2",
    professions: ["Herbalism", "Alchemy", "Fishing"],
  },
  {
    displayName: "Whacka Smacks",
    characterClass: "Shaman",
    setId: "raid-tier-1",
    professions: ["Herbalism", "Alchemy", "Fishing"],
  },
  {
    displayName: "Trolger Allaboutcrit",
    characterClass: "Hunter",
    setId: "dungeon-tier-1",
    professions: ["Leatherworking", "Skinning"],
  },
  {
    displayName: "Excedrine Allaboutcrit",
    characterClass: "Priest",
    setId: "dungeon-tier-1",
    professions: ["Tailoring", "Enchanting"],
  },
  {
    displayName: "Moo Zilal",
    characterClass: "Druid",
    setId: "raid-tier-2",
    professions: ["Herbalism", "Alchemy", "Cooking", "Fishing"],
  },
  {
    displayName: "Sar Rotting",
    characterClass: "Paladin",
    setId: "dungeon-tier-1",
    professions: ["Tailoring", "Enchanting"],
  },
  {
    displayName: "Nibcab Cabnib",
    characterClass: "Paladin",
    setId: "raid-tier-1",
    professions: ["Mining", "Blacksmithing"],
  },
  {
    displayName: "Aggressive Karen",
    characterClass: "Warlock",
    setId: "dungeon-tier-2",
    spriteSrc: karenSprite,
    professions: ["Herbalism", "Alchemy"],
  },
] as const satisfies readonly CharacterDisplay[];

const classTallies = Object.entries(characterClasses).map(
  ([name, { icon }]) => ({
    name,
    icon,
    count: characterDisplays.filter(
      (character) => character.characterClass === name,
    ).length,
  }),
);

// Derive coverage from member assignments; count each character once per profession
const professionTallies = (Object.keys(professions) as ProfessionName[]).map(
  (name) => ({
    name,
    icon: professions[name].icon,
    count: characterDisplays.filter((character: CharacterDisplay) =>
      character.professions?.some((profession) => profession === name),
    ).length,
  }),
);

const professionGroups = [
  {
    id: "crafting-professions",
    label: "Crafting Professions",
    items: professionTallies.filter(({ name }) =>
      [
        "Alchemy",
        "Blacksmithing",
        "Enchanting",
        "Engineering",
        "Leatherworking",
        "Tailoring",
      ].includes(name),
    ),
  },
  {
    id: "gathering-professions",
    label: "Gathering Professions",
    items: professionTallies.filter(({ name }) =>
      ["Herbalism", "Skinning", "Mining"].includes(name),
    ),
  },
  {
    id: "secondary-professions",
    label: "Secondary Professions",
    items: professionTallies.filter(
      ({ name }) => name === "Cooking" || name === "Fishing",
    ),
  },
];

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
    margin-inline: auto;
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
  .horde-sprites__professions {
    display: flex;
    justify-content: center;
    gap: 0.3rem;
    margin-block: 0.2rem;
  }
  .horde-sprites__professions img {
    width: 1.5rem;
    height: 1.5rem;
    border: 1px solid var(--border);
    border-radius: 0.15rem;
  }
  .horde-sprites__profession-summary {
    margin-top: 1rem;
  }
  .horde-sprites__profession-divider {
    width: min(100%, 30rem);
    margin: 0 auto 1rem;
    border: 0;
    border-top: 1px solid var(--border);
  }
  .horde-sprites__profession-tally {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem 1rem;
    list-style: none;
    margin: 0.65rem 0 0;
    padding: 0;
  }
  .horde-sprites__profession-tally li {
    display: grid;
    justify-items: center;
    align-content: start;
    gap: 0.25rem;
    flex: 0 1 6rem;
    text-align: center;
    font-size: 0.85rem;
  }
  .horde-sprites__profession-count {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
  .horde-sprites__profession-count img {
    width: 3rem;
    height: 3rem;
    border: 1px solid var(--border);
    border-radius: 0.2rem;
  }
  .horde-sprites__profession-tally [data-unclaimed="true"] {
    color: var(--muted);
  }
  .horde-sprites__profession-tally [data-unclaimed="true"] img {
    filter: grayscale(1);
    opacity: 0.4;
  }
  .horde-sprites__set-name {
    font-weight: 700;
  }
  .horde-sprites__weapons {
    display: grid;
    gap: 0.15rem;
  }
  .horde-sprites__browser {
    margin-top: 1.1rem;
    border-top: 1px solid rgb(198 216 146 / 0.18);
    padding-top: 0.8rem;
  }
  #sprite-browser {
    scroll-margin-top: 1rem;
  }
  /* Button-styled label for hierarchy only; the section is not collapsible */
  .horde-sprites__browser-heading {
    width: fit-content;
    max-width: 100%;
    margin: 0 auto 0.6rem;
    border: 1px solid rgb(198 216 146 / 0.5);
    border-radius: 0.5rem;
    padding: 0.6rem 1.25rem;
    background: rgb(198 216 146 / 0.08);
    color: var(--selected);
    text-align: center;
    font-size: 1.25rem;
    font-weight: 650;
    line-height: 1.3;
  }
  .horde-sprites__tirekickers {
    margin-top: 1.1rem;
  }
  .horde-sprites__main-heading,
  .horde-sprites__professions-heading,
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
  .horde-sprites__class-tally {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem 1rem;
    margin: 0 0 0.75rem;
    padding: 0;
    list-style: none;
  }
  .horde-sprites__class-tally li {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.9rem;
  }
  .horde-sprites__class-tally img {
    width: 2rem;
    height: 2rem;
    border: 1px solid var(--border);
    border-radius: 0.15rem;
  }
  .horde-sprites__class-tally [data-unclaimed="true"] {
    color: var(--muted);
  }
  .horde-sprites__class-tally [data-unclaimed="true"] img {
    filter: grayscale(1);
    opacity: 0.4;
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
  .horde-sprites__toolbar {
    margin-bottom: 0.75rem;
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
                <strong
                  style={{ color: characterClasses[characterClass].color }}
                >
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
  setId,
  spriteSrc,
  professions: characterProfessions = [],
}: CharacterDisplay) {
  const sprite = setGroups
    .find(({ id }) => id === setId)
    ?.items.find((item) => item.characterClass === characterClass);

  if (!sprite) return null;

  return (
    <figure className="horde-sprites__figure">
      <Sprite
        column={spriteSrc ? 0 : sprite.column}
        atlas={spriteSrc ?? sprite.atlas}
        columns={spriteSrc ? 1 : sprite.columns}
      />
      <figcaption className="horde-sprites__caption">
        <strong style={{ color: characterClasses[characterClass].color }}>
          {displayName}
        </strong>
        <span>{"<Needs Food Badly>"}</span>
        {characterProfessions.length > 0 && (
          <span className="horde-sprites__professions">
            {characterProfessions.map((profession) => (
              <img
                key={profession}
                src={professions[profession].icon}
                alt={profession}
                title={profession}
                width="24"
                height="24"
                loading="lazy"
              />
            ))}
          </span>
        )}
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
        Active Members
      </h2>
      <p className="horde-sprites__main-description">
        <em>
          Want specific gear on your sprite? Reach out to Jake with requests or
          leave a comment in the guild discord.
        </em>
      </p>
      <ul
        className="horde-sprites__class-tally"
        aria-label="Active member class representation"
      >
        {classTallies.map(({ name, icon, count }) => (
          <li key={name} data-unclaimed={count === 0} title={name}>
            <img src={icon} alt={name} width="32" height="32" />
            <span aria-label={`${count} active members`}>x{count}</span>
          </li>
        ))}
      </ul>
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
      {professionGroups.map(({ id, label, items }) => (
        <section
          key={id}
          className="horde-sprites__profession-summary"
          aria-labelledby={`${id}-heading`}
        >
          {id !== "crafting-professions" && (
            <hr className="horde-sprites__profession-divider" />
          )}
          <h2
            id={`${id}-heading`}
            className="horde-sprites__professions-heading"
          >
            {label}
          </h2>
          <ul className="horde-sprites__profession-tally">
            {items.map(({ name, icon, count }) => (
              <li key={name} data-unclaimed={count === 0}>
                <span className="horde-sprites__profession-count">
                  <img
                    src={icon}
                    alt=""
                    width="48"
                    height="48"
                    loading="lazy"
                  />
                  <span aria-label={`${count} characters`}>x{count}</span>
                </span>
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section
        className="horde-sprites__tirekickers"
        aria-labelledby="tirekickers-sprites-heading"
      >
        <h2
          id="tirekickers-sprites-heading"
          className="horde-sprites__tirekickers-heading"
        >
          Tirekickers - "I dunno man, I'll prob check it out, but I don't know
          how much I can play."
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
      <section
        id="sprite-browser"
        className="horde-sprites__browser"
        aria-labelledby="sprite-browser-heading"
      >
        <h2
          id="sprite-browser-heading"
          className="horde-sprites__browser-heading"
        >
          Custom Horde Sprites
        </h2>
        <p className="horde-sprites__gallery-description">
          Custom sprites, sortable by Class or Tier.
        </p>
        <p className="horde-sprites__gallery-description">
          All sprites have clickable wowhead links for their displayed sets and
          weapons.
        </p>
        <div className="horde-sprites__toolbar">
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
                      src={characterClasses[label].icon}
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
              <h3 id={`sprites-${id}`} className="horde-sprites__group-heading">
                {label}
              </h3>
              <SpriteLineup items={items} byClass={displayFormat === "class"} />
            </section>
          ))}
        </div>
      </section>
    </section>
  );
}
