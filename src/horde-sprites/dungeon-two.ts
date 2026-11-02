// Public references copied from selected workshop loadouts. Builds do not read the workshop
import dungeonTwoAtlas from "./dungeon_set_2/256/lineup_dungeon_set_2_256.png" with { type: "file" };
import type { SpriteCatalog } from "./types";

export const dungeonTwoIdentities = {
  src: dungeonTwoAtlas,
  frameSize: 256,
  footBaseline: 246,
  displaySize: 160,
  columns: 9,
  items: [
    {
      id: "orc-warrior-dungeon2",
      race: "Orc",
      column: 0,
      characterClass: "Warrior",
      set: {
        displayName: "Battlegear of Heroism",
        setId: 511,
      },
      weapons: [
        {
          displayName: "Quel'Serrar",
          itemId: 18348,
        },
        {
          displayName: "Drillborer Disk",
          itemId: 17066,
        },
      ],
    },
    {
      id: "orc-hunter-dungeon2",
      race: "Orc",
      column: 1,
      characterClass: "Hunter",
      set: {
        displayName: "Beastmaster Armor",
        setId: 515,
      },
      weapons: [
        {
          displayName: "Hurricane",
          itemId: 2824,
        },
        {
          displayName: "Shadowstrike",
          itemId: 17074,
        },
      ],
    },
    {
      id: "troll-rogue-dungeon2",
      race: "Troll",
      column: 2,
      characterClass: "Rogue",
      set: {
        displayName: "Darkmantle Armor",
        setId: 512,
      },
      weapons: [
        {
          displayName: "Shadowblade",
          itemId: 2163,
        },
        {
          displayName: "Alcor's Sunrazor",
          itemId: 14555,
        },
      ],
    },
    {
      id: "tauren-shaman-dungeon2",
      race: "Tauren",
      column: 3,
      characterClass: "Shaman",
      set: {
        displayName: "The Five Thunders",
        setId: 519,
      },
      weapons: [
        {
          displayName: "Sulfuron Hammer",
          itemId: 17193,
        },
      ],
    },
    {
      id: "orc-warlock-dungeon2",
      race: "Orc",
      column: 4,
      characterClass: "Warlock",
      set: {
        displayName: "Deathmist Raiment",
        setId: 518,
      },
      weapons: [
        {
          displayName: "Amberseal Keeper",
          itemId: 17113,
        },
      ],
    },
    {
      id: "undead-mage-dungeon2",
      race: "Undead",
      column: 5,
      characterClass: "Mage",
      set: {
        displayName: "Sorcerer's Regalia",
        setId: 517,
      },
      weapons: [
        {
          displayName: "Blade of Necromancy",
          itemId: 22332,
        },
        {
          displayName: "Sorcerer-themed spellbook",
          itemId: null,
        },
      ],
    },
    {
      id: "skyborne-priest-dungeon2",
      race: "Skyborne",
      column: 6,
      characterClass: "Priest",
      set: {
        displayName: "Vestments of the Virtuous",
        setId: 514,
      },
      weapons: [
        {
          displayName: "Staff of Jordan",
          itemId: 873,
        },
      ],
    },
    {
      id: "undead-paladin-dungeon2",
      race: "Undead",
      column: 7,
      characterClass: "Paladin",
      set: {
        displayName: "Soulforge Armor",
        setId: 516,
      },
      weapons: [
        {
          displayName: "Destiny",
          itemId: 647,
        },
      ],
    },
    {
      id: "tauren-druid-dungeon2",
      race: "Tauren",
      column: 8,
      characterClass: "Druid",
      set: {
        displayName: "Feralheart Raiment",
        setId: 513,
      },
      weapons: [
        {
          displayName: "Spire of the Stoneshaper",
          itemId: 12532,
        },
      ],
    },
  ],
} as const satisfies SpriteCatalog;
