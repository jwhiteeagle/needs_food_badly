// Finalized public class identities. Masters and tooling stay in the private workshop.
import classAtlas from "./raid_tier_2/256/lineup_raid_tier_2_256.png" with { type: "file" };
import tierOneAtlas from "./raid_tier_1/256/lineup_raid_tier_1_256.png" with { type: "file" };

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
      set: "Wrath",
      weapon: "Thunderfury ×2",
      weaponUrl: "https://www.wowhead.com/classic/item=19019",
    },
    {
      id: "orc-hunter",
      race: "Orc",
      column: 1,
      characterClass: "Hunter",
      set: "Dragonstalker",
      weapon: "Rhok’delar + Lok’delar",
      weaponUrl: "https://www.wowhead.com/classic/item=18713",
    },
    {
      id: "troll-rogue",
      race: "Troll",
      column: 2,
      characterClass: "Rogue",
      set: "Bloodfang",
      weapon: "Perdition’s Blade + Core Hound Tooth",
      weaponUrl: "https://www.wowhead.com/classic/item=18816",
    },
    {
      id: "tauren-shaman",
      race: "Tauren",
      column: 3,
      characterClass: "Shaman",
      set: "The Ten Storms",
      weapon: "Sulfuras",
      weaponUrl: "https://www.wowhead.com/classic/item=17182",
    },
    {
      id: "orc-warlock",
      race: "Orc",
      column: 4,
      characterClass: "Warlock",
      set: "Nemesis",
      weapon: "Staff of the Shadow Flame",
      weaponUrl: "https://www.wowhead.com/classic/item=19356",
    },
    {
      id: "undead-mage",
      race: "Undead",
      column: 5,
      characterClass: "Mage",
      set: "Netherwind",
      weapon: "Azuresong Mageblade + spellbook",
      weaponUrl: "https://www.wowhead.com/classic/item=17103",
    },
    {
      id: "skyborne-priest",
      race: "Skyborne",
      column: 6,
      characterClass: "Priest",
      set: "Transcendence",
      weapon: "Benediction",
      weaponUrl: "https://www.wowhead.com/classic/item=18608",
    },
    {
      id: "undead-paladin",
      race: "Undead",
      column: 7,
      characterClass: "Paladin",
      set: "Judgment",
      weapon: "Corrupted Ashbringer",
      weaponUrl: "https://www.wowhead.com/classic/item=22691",
    },
    {
      id: "tauren-druid",
      race: "Tauren",
      column: 8,
      characterClass: "Druid",
      set: "Stormrage",
      weapon: "Warden Staff",
      weaponUrl: "https://www.wowhead.com/classic/item=943",
    },
  ],
} as const;

export const tierOneIdentities = {
  src: tierOneAtlas,
  frameSize: 256,
  footBaseline: 246,
  displaySize: 160,
  columns: 9,
  items: [
    {
      "id": "orc-warrior-tier1",
      "race": "Orc",
      "column": 0,
      "characterClass": "Warrior",
      "set": "Might",
      "weapon": "Vis'kag the Bloodletter + Brutality Blade",
      "weaponUrl": "https://www.wowhead.com/classic/item=17075"
    },
    {
      "id": "orc-hunter-tier1",
      "race": "Orc",
      "column": 1,
      "characterClass": "Hunter",
      "set": "Giantstalker",
      "weapon": "Striker's Mark + Blackhand Doomsaw",
      "weaponUrl": "https://www.wowhead.com/classic/item=17069"
    },
    {
      "id": "troll-rogue-tier1",
      "race": "Troll",
      "column": 2,
      "characterClass": "Rogue",
      "set": "Nightslayer",
      "weapon": "Gutgore Ripper + Felstriker",
      "weaponUrl": "https://www.wowhead.com/classic/item=17071"
    },
    {
      "id": "tauren-shaman-tier1",
      "race": "Tauren",
      "column": 3,
      "characterClass": "Shaman",
      "set": "The Earthfury",
      "weapon": "Earthshaker",
      "weaponUrl": "https://www.wowhead.com/classic/item=17073"
    },
    {
      "id": "orc-warlock-tier1",
      "race": "Orc",
      "column": 4,
      "characterClass": "Warlock",
      "set": "Felheart",
      "weapon": "Headmaster's Charge",
      "weaponUrl": "https://www.wowhead.com/classic/item=13937"
    },
    {
      "id": "undead-mage-tier1",
      "race": "Undead",
      "column": 5,
      "characterClass": "Mage",
      "set": "Arcanist",
      "weapon": "Inventor's Focal Sword + Arcanist-themed spellbook",
      "weaponUrl": "https://www.wowhead.com/classic/item=17719"
    },
    {
      "id": "skyborne-priest-tier1",
      "race": "Skyborne",
      "column": 6,
      "characterClass": "Priest",
      "set": "Prophecy",
      "weapon": "Staff of Dominance",
      "weaponUrl": "https://www.wowhead.com/classic/item=18842"
    },
    {
      "id": "undead-paladin-tier1",
      "race": "Undead",
      "column": 7,
      "characterClass": "Paladin",
      "set": "Lawbringer",
      "weapon": "Obsidian Edged Blade",
      "weaponUrl": "https://www.wowhead.com/classic/item=18822"
    },
    {
      "id": "tauren-druid-tier1",
      "race": "Tauren",
      "column": 8,
      "characterClass": "Druid",
      "set": "Cenarion",
      "weapon": "Glowing Brightwood Staff",
      "weaponUrl": "https://www.wowhead.com/classic/item=812"
    }
  ],
} as const;
