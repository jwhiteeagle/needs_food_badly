// Public references copied from selected workshop loadouts. Builds do not read the workshop
import epicAtlas from "./pvp_sets/horde/pvp_epic/256/lineup_horde_pvp_epic_256.png" with { type: "file" };
import rareAtlas from "./pvp_sets/horde/pvp_rare/256/lineup_horde_pvp_rare_256.png" with { type: "file" };
import type { SpriteCatalog } from "./types";

export const pvpEpicIdentities = {
  src: epicAtlas,
  frameSize: 256,
  footBaseline: 246,
  displaySize: 160,
  columns: 9,
  items: [
    {
      id: "orc-warrior-horde-pvp_epic",
      race: "Orc",
      column: 0,
      characterClass: "Warrior",
      set: {
        displayName: "Warlord's Battlegear",
        setId: 383,
      },
      weapons: [
        {
          displayName: "High Warlord's Greatsword",
          itemId: 18877,
        },
      ],
    },
    {
      id: "orc-hunter-horde-pvp_epic",
      race: "Orc",
      column: 1,
      characterClass: "Hunter",
      set: {
        displayName: "Warlord's Pursuit",
        setId: 396,
      },
      weapons: [
        {
          displayName: "High Warlord's Recurve",
          itemId: 18835,
        },
        {
          displayName: "High Warlord's Pig Sticker",
          itemId: 18871,
        },
      ],
    },
    {
      id: "troll-rogue-horde-pvp_epic",
      race: "Troll",
      column: 2,
      characterClass: "Rogue",
      set: {
        displayName: "Warlord's Vestments",
        setId: 393,
      },
      weapons: [
        {
          displayName: "High Warlord's Razor",
          itemId: 18840,
        },
        {
          displayName: "High Warlord's Razor",
          itemId: 18840,
        },
      ],
    },
    {
      id: "tauren-shaman-horde-pvp_epic",
      race: "Tauren",
      column: 3,
      characterClass: "Shaman",
      set: {
        displayName: "Warlord's Earthshaker",
        setId: 386,
      },
      weapons: [
        {
          displayName: "High Warlord's Pulverizer",
          itemId: 18868,
        },
      ],
    },
    {
      id: "orc-warlock-horde-pvp_epic",
      race: "Orc",
      column: 4,
      characterClass: "Warlock",
      set: {
        displayName: "Warlord's Threads",
        setId: 391,
      },
      weapons: [
        {
          displayName: "High Warlord's War Staff",
          itemId: 18874,
        },
      ],
    },
    {
      id: "undead-mage-horde-pvp_epic",
      race: "Undead",
      column: 5,
      characterClass: "Mage",
      set: {
        displayName: "Warlord's Regalia",
        setId: 387,
      },
      weapons: [
        {
          displayName: "High Warlord's Spellblade",
          itemId: 23466,
        },
        {
          displayName: "High Warlord's Tome of Destruction",
          itemId: 23468,
        },
      ],
    },
    {
      id: "skyborne-priest-horde-pvp_epic",
      race: "Skyborne",
      column: 6,
      characterClass: "Priest",
      set: {
        displayName: "Warlord's Raiment",
        setId: 390,
      },
      weapons: [
        {
          displayName: "High Warlord's War Staff",
          itemId: 18874,
        },
      ],
    },
    {
      id: "undead-paladin-horde-pvp_epic",
      race: "Undead",
      column: 7,
      characterClass: "Paladin",
      set: {
        displayName: "Field Marshal's Aegis",
        setId: 402,
      },
      weapons: [
        {
          displayName: "High Warlord's Greatsword",
          itemId: 18877,
        },
      ],
    },
    {
      id: "tauren-druid-horde-pvp_epic",
      race: "Tauren",
      column: 8,
      characterClass: "Druid",
      set: {
        displayName: "Warlord's Sanctuary",
        setId: 398,
      },
      weapons: [
        {
          displayName: "High Warlord's War Staff",
          itemId: 18874,
        },
      ],
    },
  ],
} as const satisfies SpriteCatalog;

export const pvpRareIdentities = {
  src: rareAtlas,
  frameSize: 256,
  footBaseline: 246,
  displaySize: 160,
  columns: 9,
  items: [
    {
      id: "orc-warrior-horde-pvp_rare",
      race: "Orc",
      column: 0,
      characterClass: "Warrior",
      set: {
        displayName: "Champion's Battlearmor",
        setId: 537,
      },
      weapons: [
        {
          displayName: "The Unstoppable Force",
          itemId: 19323,
        },
      ],
    },
    {
      id: "orc-hunter-horde-pvp_rare",
      race: "Orc",
      column: 1,
      characterClass: "Hunter",
      set: {
        displayName: "Champion's Pursuance",
        setId: 543,
      },
      weapons: [
        {
          displayName: "Outrider's Bow",
          itemId: 19558,
        },
        {
          displayName: "Ice Barbed Spear",
          itemId: 19106,
        },
      ],
    },
    {
      id: "troll-rogue-horde-pvp_rare",
      race: "Troll",
      column: 2,
      characterClass: "Rogue",
      set: {
        displayName: "Champion's Guard",
        setId: 522,
      },
      weapons: [
        {
          displayName: "The Lobotomizer",
          itemId: 19324,
        },
        {
          displayName: "Scout's Blade",
          itemId: 19542,
        },
      ],
    },
    {
      id: "tauren-shaman-horde-pvp_rare",
      race: "Tauren",
      column: 3,
      characterClass: "Shaman",
      set: {
        displayName: "Champion's Stormcaller",
        setId: 538,
      },
      weapons: [
        {
          displayName: "The Unstoppable Force",
          itemId: 19323,
        },
      ],
    },
    {
      id: "orc-warlock-horde-pvp_rare",
      race: "Orc",
      column: 4,
      characterClass: "Warlock",
      set: {
        displayName: "Champion's Dreadgear",
        setId: 541,
      },
      weapons: [
        {
          displayName: "Whiteout Staff",
          itemId: 19101,
        },
      ],
    },
    {
      id: "undead-mage-horde-pvp_rare",
      race: "Undead",
      column: 5,
      characterClass: "Mage",
      set: {
        displayName: "Champion's Arcanum",
        setId: 542,
      },
      weapons: [
        {
          displayName: "Mindfang",
          itemId: 20214,
        },
        {
          displayName: "Tome of the Ice Lord",
          itemId: 19310,
        },
      ],
    },
    {
      id: "skyborne-priest-horde-pvp_rare",
      race: "Skyborne",
      column: 6,
      characterClass: "Priest",
      set: {
        displayName: "Champion's Investiture",
        setId: 540,
      },
      weapons: [
        {
          displayName: "Advisor's Gnarled Staff",
          itemId: 19566,
        },
      ],
    },
    {
      id: "undead-paladin-horde-pvp_rare",
      race: "Undead",
      column: 7,
      characterClass: "Paladin",
      set: {
        displayName: "Lieutenant Commander's Redoubt",
        setId: 544,
      },
      weapons: [
        {
          displayName: "The Unstoppable Force",
          itemId: 19323,
        },
      ],
    },
    {
      id: "tauren-druid-horde-pvp_rare",
      race: "Tauren",
      column: 8,
      characterClass: "Druid",
      set: {
        displayName: "Champion's Refuge",
        setId: 539,
      },
      weapons: [
        {
          displayName: "Ironbark Staff",
          itemId: 20220,
        },
      ],
    },
  ],
} as const satisfies SpriteCatalog;
