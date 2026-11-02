import { expect, test } from "bun:test";
import { classicLink, foreverLink } from "../src/helper-modules";
import {
  classIdentities,
  tierOneIdentities,
} from "../src/horde-sprites/assets";
import { dungeonOneIdentities } from "../src/horde-sprites/dungeon-one";
import { dungeonTwoIdentities } from "../src/horde-sprites/dungeon-two";
import { pvpEpicIdentities, pvpRareIdentities } from "../src/horde-sprites/pvp";
import { tierThreeIdentities } from "../src/horde-sprites/tier-three";
import type { SpriteCatalog } from "../src/horde-sprites/types";

const catalogs: readonly SpriteCatalog[] = [
  classIdentities,
  tierOneIdentities,
  tierThreeIdentities,
  dungeonOneIdentities,
  dungeonTwoIdentities,
  pvpEpicIdentities,
  pvpRareIdentities,
];

test("routes the Protection Warrior's sword, shield and armor to distinct records", () => {
  const warrior = tierThreeIdentities.items[0];
  expect(warrior.weapons.map(({ itemId }) => itemId)).toEqual([23577, 23043]);
  expect(classicLink.item(warrior.weapons[0].itemId)).toBe(
    "https://www.wowhead.com/classic/item=23577",
  );
  expect(classicLink.item(warrior.weapons[1].itemId)).toBe(
    "https://www.wowhead.com/classic/item=23043",
  );
  expect(classicLink.set(warrior.set.setId)).toBe(
    "https://www.wowhead.com/classic/item-set=523",
  );
});

test("retains paired and repeated equipment instead of one combined primary-item link", () => {
  expect(classIdentities.items[1].weapons.map(({ itemId }) => itemId)).toEqual([
    18713, 18715,
  ]);
  expect(classIdentities.items[0].weapons.map(({ itemId }) => itemId)).toEqual([
    19019, 19019,
  ]);
  expect(
    pvpRareIdentities.items[5].weapons.map(({ itemId }) => itemId),
  ).toEqual([20214, 19310]);
});

test("links completed armor sets while generic art props remain unlinked and labels editable", () => {
  expect(dungeonOneIdentities.items[5].set.setId).toBe(181);
  expect(classicLink.set(dungeonOneIdentities.items[5].set.setId)).toBe(
    "https://www.wowhead.com/classic/item-set=181",
  );
  expect(dungeonOneIdentities.items[5].weapons[1].itemId).toBeNull();
  const customLabel = { displayName: "Jordan", itemId: 873 };
  expect(foreverLink.item(customLabel.itemId)).toBe(
    "https://www.wowhead.com/forever/item=873",
  );
  expect(foreverLink.set(218)).toBe(
    "https://www.wowhead.com/forever/item-set=218",
  );
});

test("catalog references retain names and valid IDs as catalogs grow", () => {
  for (const catalog of catalogs) {
    for (const sprite of catalog.items) {
      expect(sprite.set.displayName.trim().length).toBeGreaterThan(0);
      expect(sprite.set.setId).not.toBeNull();
      if (sprite.set.setId !== null) {
        expect(Number.isSafeInteger(sprite.set.setId)).toBe(true);
        expect(sprite.set.setId).toBeGreaterThan(0);
      }
      expect(sprite.weapons.length).toBeGreaterThan(0);
      for (const weapon of sprite.weapons) {
        expect(weapon.displayName.trim().length).toBeGreaterThan(0);
        if (weapon.itemId !== null) {
          expect(Number.isSafeInteger(weapon.itemId)).toBe(true);
          expect(weapon.itemId).toBeGreaterThan(0);
        }
      }
    }
  }
});

test("Horde PvP redirects use Champion and Warlord full sets with the approved Paladin exception", () => {
  for (const sprite of pvpRareIdentities.items) {
    expect(
      sprite.set.displayName.startsWith(
        sprite.characterClass === "Paladin"
          ? "Lieutenant Commander"
          : "Champion",
      ),
    ).toBe(true);
  }
  for (const sprite of pvpEpicIdentities.items) {
    expect(
      sprite.set.displayName.startsWith(
        sprite.characterClass === "Paladin" ? "Field Marshal" : "Warlord",
      ),
    ).toBe(true);
  }
});

test("rejects IDs that would create a malformed or fabricated record destination", () => {
  for (const id of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    expect(() => classicLink.item(id)).toThrow(RangeError);
    expect(() => foreverLink.set(id)).toThrow(RangeError);
  }
});
