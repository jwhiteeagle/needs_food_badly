// Shared Wowhead destinations for sprite captions and market cards
// Labels stay with consumers. Route construction performs no network requests

// Unknown source IDs stay null so consumers can show text without inventing links
export type ItemReference = {
  displayName: string;
  itemId: number | null;
};

export type SetReference = {
  displayName: string;
  setId: number | null;
};

// Bind the database version once so each public caller supplies only an ID
function wowheadLinks(version: "classic" | "forever") {
  function link(type: "item" | "item-set" | "spell", id: number): string {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new RangeError("Wowhead IDs must be positive integers");
    }
    return `https://www.wowhead.com/${version}/${type}=${id}`;
  }

  return {
    item: (itemId: number) => link("item", itemId),
    set: (setId: number) => link("item-set", setId),
    spell: (spellId: number) => link("spell", spellId),
  };
}

export const classicLink = wowheadLinks("classic");
export const foreverLink = wowheadLinks("forever");
