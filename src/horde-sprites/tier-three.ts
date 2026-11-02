// Public references copied from selected workshop loadouts. Builds do not read the workshop
import tierThreeAtlas from "./raid_tier_3/256/lineup_raid_tier_3_256.png" with { type: "file" };
import type { SpriteCatalog } from "./types";

export const tierThreeIdentities = {
  src: tierThreeAtlas,
  frameSize: 256,
  footBaseline: 246,
  displaySize: 160,
  columns: 9,
  items: [
    {
      id: "orc-warrior-tier3",
      race: "Orc",
      column: 0,
      characterClass: "Warrior",
      set: {
        displayName: "Dreadnaught's Battlegear",
        setId: 523,
      },
      weapons: [
        {
          displayName: "The Hungering Cold",
          itemId: 23577,
        },
        {
          displayName: "The Face of Death",
          itemId: 23043,
        },
      ],
    },
    {
      id: "orc-hunter-tier3",
      race: "Orc",
      column: 1,
      characterClass: "Hunter",
      set: {
        displayName: "Cryptstalker Armor",
        setId: 530,
      },
      weapons: [
        {
          displayName: "Nerubian Slavemaker",
          itemId: 22812,
        },
        {
          displayName: "The Eye of Nerub",
          itemId: 23039,
        },
      ],
    },
    {
      id: "troll-rogue-tier3",
      race: "Troll",
      column: 2,
      characterClass: "Rogue",
      set: {
        displayName: "Bonescythe Armor",
        setId: 524,
      },
      weapons: [
        {
          displayName: "Kingsfall",
          itemId: 22802,
        },
        {
          displayName: "Maexxna's Fang",
          itemId: 22804,
        },
      ],
    },
    {
      id: "tauren-shaman-tier3",
      race: "Tauren",
      column: 3,
      characterClass: "Shaman",
      set: {
        displayName: "The Earthshatterer",
        setId: 527,
      },
      weapons: [
        {
          displayName: "Might of Menethil",
          itemId: 22798,
        },
      ],
    },
    {
      id: "orc-warlock-tier3",
      race: "Orc",
      column: 4,
      characterClass: "Warlock",
      set: {
        displayName: "Plagueheart Raiment",
        setId: 529,
      },
      weapons: [
        {
          displayName: "Soulseeker",
          itemId: 22799,
        },
      ],
    },
    {
      id: "undead-mage-tier3",
      race: "Undead",
      column: 5,
      characterClass: "Mage",
      set: {
        displayName: "Frostfire Regalia",
        setId: 526,
      },
      weapons: [
        {
          displayName: "Wraith Blade",
          itemId: 22807,
        },
        {
          displayName: "Sapphiron's Left Eye",
          itemId: 23049,
        },
      ],
    },
    {
      id: "skyborne-priest-tier3",
      race: "Skyborne",
      column: 6,
      characterClass: "Priest",
      set: {
        displayName: "Vestments of Faith",
        setId: 525,
      },
      weapons: [
        {
          displayName: "Spire of Twilight",
          itemId: 22801,
        },
      ],
    },
    {
      id: "undead-paladin-tier3",
      race: "Undead",
      column: 7,
      characterClass: "Paladin",
      set: {
        displayName: "Redemption Armor",
        setId: 528,
      },
      weapons: [
        {
          displayName: "Claymore of Unholy Might",
          itemId: 22813,
        },
      ],
    },
    {
      id: "tauren-druid-tier3",
      race: "Tauren",
      column: 8,
      characterClass: "Druid",
      set: {
        displayName: "Dreamwalker Raiment",
        setId: 521,
      },
      weapons: [
        {
          displayName: "Atiesh, Greatstaff of the Guardian",
          itemId: 22632,
        },
      ],
    },
  ],
} as const satisfies SpriteCatalog;
