// Public references copied from selected workshop loadouts. Builds do not read the workshop
import classAtlas from "./raid_tier_2/256/lineup_raid_tier_2_256.png" with { type: "file" };
import tierOneAtlas from "./raid_tier_1/256/lineup_raid_tier_1_256.png" with { type: "file" };
import type { SpriteCatalog } from "./types";

export const classIdentities = {
  src: classAtlas,
  frameSize: 256,
  footBaseline: 246,
  displaySize: 160,
  columns: 9,
  items: [
    {
      id: "orc-warrior",
      race: "Orc",
      column: 0,
      characterClass: "Warrior",
      set: {
        displayName: "Battlegear of Wrath",
        setId: 218,
      },
      weapons: [
        {
          displayName: "Thunderfury, Blessed Blade of the Windseeker",
          itemId: 19019,
        },
        {
          displayName: "Thunderfury, Blessed Blade of the Windseeker",
          itemId: 19019,
        },
      ],
    },
    {
      id: "orc-hunter",
      race: "Orc",
      column: 1,
      characterClass: "Hunter",
      set: {
        displayName: "Dragonstalker Armor",
        setId: 215,
      },
      weapons: [
        {
          displayName: "Rhok'delar, Longbow of the Ancient Keepers",
          itemId: 18713,
        },
        {
          displayName: "Lok'delar, Stave of the Ancient Keepers",
          itemId: 18715,
        },
      ],
    },
    {
      id: "troll-rogue",
      race: "Troll",
      column: 2,
      characterClass: "Rogue",
      set: {
        displayName: "Bloodfang Armor",
        setId: 213,
      },
      weapons: [
        {
          displayName: "Perdition's Blade",
          itemId: 18816,
        },
        {
          displayName: "Core Hound Tooth",
          itemId: 18805,
        },
      ],
    },
    {
      id: "tauren-shaman",
      race: "Tauren",
      column: 3,
      characterClass: "Shaman",
      set: {
        displayName: "The Ten Storms",
        setId: 216,
      },
      weapons: [
        {
          displayName: "Sulfuras, Hand of Ragnaros",
          itemId: 17182,
        },
      ],
    },
    {
      id: "orc-warlock",
      race: "Orc",
      column: 4,
      characterClass: "Warlock",
      set: {
        displayName: "Nemesis Raiment",
        setId: 212,
      },
      weapons: [
        {
          displayName: "Staff of the Shadow Flame",
          itemId: 19356,
        },
      ],
    },
    {
      id: "undead-mage",
      race: "Undead",
      column: 5,
      characterClass: "Mage",
      set: {
        displayName: "Netherwind Regalia",
        setId: 210,
      },
      weapons: [
        {
          displayName: "Azuresong Mageblade",
          itemId: 17103,
        },
        {
          displayName: "Netherwind-themed spellbook",
          itemId: null,
        },
      ],
    },
    {
      id: "skyborne-priest",
      race: "Skyborne",
      column: 6,
      characterClass: "Priest",
      set: {
        displayName: "Vestments of Transcendence",
        setId: 211,
      },
      weapons: [
        {
          displayName: "Benediction",
          itemId: 18608,
        },
      ],
    },
    {
      id: "undead-paladin",
      race: "Undead",
      column: 7,
      characterClass: "Paladin",
      set: {
        displayName: "Judgement Armor",
        setId: 217,
      },
      weapons: [
        {
          displayName: "Corrupted Ashbringer",
          itemId: 22691,
        },
      ],
    },
    {
      id: "tauren-druid",
      race: "Tauren",
      column: 8,
      characterClass: "Druid",
      set: {
        displayName: "Stormrage Raiment",
        setId: 214,
      },
      weapons: [
        {
          displayName: "Warden Staff",
          itemId: 943,
        },
      ],
    },
  ],
} as const satisfies SpriteCatalog;

export const tierOneIdentities = {
  src: tierOneAtlas,
  frameSize: 256,
  footBaseline: 246,
  displaySize: 160,
  columns: 9,
  items: [
    {
      id: "orc-warrior-tier1",
      race: "Orc",
      column: 0,
      characterClass: "Warrior",
      set: {
        displayName: "Battlegear of Might",
        setId: 209,
      },
      weapons: [
        {
          displayName: "Vis'kag the Bloodletter",
          itemId: 17075,
        },
        {
          displayName: "Brutality Blade",
          itemId: 18832,
        },
      ],
    },
    {
      id: "orc-hunter-tier1",
      race: "Orc",
      column: 1,
      characterClass: "Hunter",
      set: {
        displayName: "Giantstalker Armor",
        setId: 206,
      },
      weapons: [
        {
          displayName: "Striker's Mark",
          itemId: 17069,
        },
        {
          displayName: "Blackhand Doomsaw",
          itemId: 12583,
        },
      ],
    },
    {
      id: "troll-rogue-tier1",
      race: "Troll",
      column: 2,
      characterClass: "Rogue",
      set: {
        displayName: "Nightslayer Armor",
        setId: 204,
      },
      weapons: [
        {
          displayName: "Gutgore Ripper",
          itemId: 17071,
        },
        {
          displayName: "Felstriker",
          itemId: 12590,
        },
      ],
    },
    {
      id: "tauren-shaman-tier1",
      race: "Tauren",
      column: 3,
      characterClass: "Shaman",
      set: {
        displayName: "The Earthfury",
        setId: 207,
      },
      weapons: [
        {
          displayName: "Earthshaker",
          itemId: 17073,
        },
      ],
    },
    {
      id: "orc-warlock-tier1",
      race: "Orc",
      column: 4,
      characterClass: "Warlock",
      set: {
        displayName: "Felheart Raiment",
        setId: 203,
      },
      weapons: [
        {
          displayName: "Headmaster's Charge",
          itemId: 13937,
        },
      ],
    },
    {
      id: "undead-mage-tier1",
      race: "Undead",
      column: 5,
      characterClass: "Mage",
      set: {
        displayName: "Arcanist Regalia",
        setId: 201,
      },
      weapons: [
        {
          displayName: "Inventor's Focal Sword",
          itemId: 17719,
        },
        {
          displayName: "Arcanist-themed spellbook",
          itemId: null,
        },
      ],
    },
    {
      id: "skyborne-priest-tier1",
      race: "Skyborne",
      column: 6,
      characterClass: "Priest",
      set: {
        displayName: "Vestments of Prophecy",
        setId: 202,
      },
      weapons: [
        {
          displayName: "Staff of Dominance",
          itemId: 18842,
        },
      ],
    },
    {
      id: "undead-paladin-tier1",
      race: "Undead",
      column: 7,
      characterClass: "Paladin",
      set: {
        displayName: "Lawbringer Armor",
        setId: 208,
      },
      weapons: [
        {
          displayName: "Obsidian Edged Blade",
          itemId: 18822,
        },
      ],
    },
    {
      id: "tauren-druid-tier1",
      race: "Tauren",
      column: 8,
      characterClass: "Druid",
      set: {
        displayName: "Cenarion Raiment",
        setId: 205,
      },
      weapons: [
        {
          displayName: "Glowing Brightwood Staff",
          itemId: 812,
        },
      ],
    },
  ],
} as const satisfies SpriteCatalog;
