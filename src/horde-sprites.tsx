import { useState } from "react";
import { classIdentities, tierOneIdentities } from "./horde-sprites/assets";
import { pvpEpicIdentities, pvpRareIdentities } from "./horde-sprites/pvp";

const spriteSize = classIdentities.displaySize;

const spriteSets = [
  { id: "raid-tier-2", label: "Raid Tier 2", collection: classIdentities },
  { id: "raid-tier-1", label: "Raid Tier 1", collection: tierOneIdentities },
  { id: "pvp-epic", label: "PvP Epic (Horde)", collection: pvpEpicIdentities },
  { id: "pvp-rare", label: "PvP Rare (Horde)", collection: pvpRareIdentities },
] as const;

const setGroups = spriteSets.map(({ id, label, collection }) => ({
  id,
  label,
  items: collection.items.map((item) => ({
    ...item,
    atlas: collection.src,
    groupLabel: label,
  })),
}));

type GallerySprite = (typeof setGroups)[number]["items"][number];

const classGroups = classIdentities.items.map(({ characterClass }) => ({
  id: `class-${characterClass.toLowerCase()}`,
  label: characterClass,
  // PvP Rare, PvP Epic, Raid Tier 1, then Raid Tier 2.
  items: [...setGroups].reverse().flatMap(({ items }) =>
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
    displayName: "Green Archer",
    characterClass: "Hunter",
    color: "#ABD473",
    setId: "raid-tier-1",
  },
  {
    displayName: "Green Warrior",
    characterClass: "Warrior",
    color: "#C79C6E",
    setId: "raid-tier-2",
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
] as const;

// Manual class assignments, in the same order as the current tirekicker list.
const tirekickerClasses = [
  "Druid",
  "Hunter",
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
  .horde-sprites__tirekickers-heading {
    margin: 0 0 0.4rem;
    color: var(--muted);
    text-align: center;
    font-size: 0.9rem;
    font-weight: 650;
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
    margin-bottom: 1rem;
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
  size = spriteSize,
  label,
}: {
  column: number;
  atlas?: string;
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
        backgroundSize: `${size * classIdentities.columns}px ${size}px`,
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
          groupLabel,
        }) => (
          <li key={id}>
            <figure className="horde-sprites__figure">
              <Sprite column={column} atlas={atlas} />
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
      <Sprite column={sprite.column} atlas={sprite.atlas} />
      <figcaption className="horde-sprites__caption">
        <strong style={{ color }}>{displayName}</strong>
        <span>{"<Needs Food Badly>"}</span>
      </figcaption>
    </figure>
  );
}

export function HordeSprites() {
  const [displayFormat, setDisplayFormat] = useState<"set" | "class">("set");
  const groups = displayFormat === "set" ? setGroups : classGroups;

  return (
    <section className="horde-sprites" aria-label="Horde adventurers">
      <style>{styles}</style>
      <ul className="horde-sprites__lineup" aria-label="Featured characters">
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
        <label className="horde-sprites__display">
          Display sprites by
          <select
            value={displayFormat}
            onChange={(event) =>
              setDisplayFormat(
                event.currentTarget.value === "class" ? "class" : "set",
              )
            }
          >
            <option value="set">Set</option>
            <option value="class">Tier</option>
          </select>
        </label>
        {groups.map(({ id, label, items }) => (
          <section
            key={id}
            className="horde-sprites__group"
            aria-labelledby={`sprites-${id}`}
          >
            <h2 id={`sprites-${id}`} className="horde-sprites__group-heading">
              {label}
            </h2>
            <SpriteLineup items={items} byClass={displayFormat === "class"} />
          </section>
        ))}
      </details>
    </section>
  );
}
