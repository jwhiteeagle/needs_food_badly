// Public references copied from selected workshop loadouts. Builds do not read the workshop
import dungeonOneAtlas from "./dungeon_set_1/256/lineup_dungeon_set_1_256.png" with { type: "file" };
import type { SpriteCatalog } from "./types";

export const dungeonOneIdentities = {
  src: dungeonOneAtlas,
  frameSize: 256,
  footBaseline: 246,
  displaySize: 160,
  columns: 9,
  items: [
    {
      id: "orc-warrior-dungeon1",
      race: "Orc",
      column: 0,
      characterClass: "Warrior",
      set: {
        displayName: "Battlegear of Valor",
        setId: 189,
      },
      weapons: [
        {
          displayName: "Dal'Rend's Sacred Charge",
          itemId: 12940,
        },
        {
          displayName: "Dal'Rend's Tribal Guardian",
          itemId: 12939,
        },
      ],
    },
    {
      id: "troll-hunter-dungeon1",
      race: "Troll",
      column: 1,
      characterClass: "Hunter",
      set: {
        displayName: "Beaststalker Armor",
        setId: 186,
      },
      weapons: [
        {
          displayName: "Ancient Bone Bow",
          itemId: 18680,
        },
        {
          displayName: "Peacemaker",
          itemId: 18725,
        },
      ],
    },
    {
      id: "troll-rogue-dungeon1",
      race: "Troll",
      column: 2,
      characterClass: "Rogue",
      set: {
        displayName: "Shadowcraft Armor",
        setId: 184,
      },
      weapons: [
        {
          displayName: "Barman Shanker",
          itemId: 12791,
        },
        {
          displayName: "Frightalon",
          itemId: 14024,
        },
      ],
    },
    {
      id: "tauren-shaman-dungeon1",
      race: "Tauren",
      column: 3,
      characterClass: "Shaman",
      set: {
        displayName: "The Elements",
        setId: 187,
      },
      weapons: [
        {
          displayName: "Fist of Omokk",
          itemId: 13167,
        },
      ],
    },
    {
      id: "orc-warlock-dungeon1",
      race: "Orc",
      column: 4,
      characterClass: "Warlock",
      set: {
        displayName: "Dreadmist Raiment",
        setId: 183,
      },
      weapons: [
        {
          displayName: "Rod of the Ogre Magi",
          itemId: 18534,
        },
      ],
    },
    {
      id: "undead-mage-dungeon1",
      race: "Undead",
      column: 5,
      characterClass: "Mage",
      set: {
        displayName: "Magister's Regalia",
        setId: 181,
      },
      weapons: [
        {
          displayName: "Inventor's Focal Sword",
          itemId: 17719,
        },
        {
          displayName: "Magister-themed spellbook",
          itemId: null,
        },
      ],
    },
    {
      id: "skyborne-priest-dungeon1",
      race: "Skyborne",
      column: 6,
      characterClass: "Priest",
      set: {
        displayName: "Vestments of the Devout",
        setId: 182,
      },
      weapons: [
        {
          displayName: "Guiding Stave of Wisdom",
          itemId: 11932,
        },
      ],
    },
    {
      id: "undead-paladin-dungeon1",
      race: "Undead",
      column: 7,
      characterClass: "Paladin",
      set: {
        displayName: "Lightforge Armor",
        setId: 188,
      },
      weapons: [
        {
          displayName: "Demonshear",
          itemId: 13348,
        },
      ],
    },
    {
      id: "tauren-druid-dungeon1",
      race: "Tauren",
      column: 8,
      characterClass: "Druid",
      set: {
        displayName: "Wildheart Raiment",
        setId: 185,
      },
      weapons: [
        {
          displayName: "Slavedriver's Cane",
          itemId: 13372,
        },
      ],
    },
  ],
} as const satisfies SpriteCatalog;
