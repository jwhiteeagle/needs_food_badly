import warriorIcon from "./assets/wow/warrior.jpg" with { type: "file" };
import hunterIcon from "./assets/wow/hunter.jpg" with { type: "file" };
import rogueIcon from "./assets/wow/rogue.jpg" with { type: "file" };
import shamanIcon from "./assets/wow/shaman.jpg" with { type: "file" };
import warlockIcon from "./assets/wow/warlock.jpg" with { type: "file" };
import mageIcon from "./assets/wow/mage.jpg" with { type: "file" };
import priestIcon from "./assets/wow/priest.jpg" with { type: "file" };
import paladinIcon from "./assets/wow/paladin.jpg" with { type: "file" };
import druidIcon from "./assets/wow/druid.jpg" with { type: "file" };
import dungeonOneArtwork from "./assets/wow/tiers/dungeon_set_1_artwork.webp" with { type: "file" };
import dungeonTwoArtwork from "./assets/wow/tiers/dungeon_set_2_artwork.webp" with { type: "file" };
import pvpRareArtwork from "./assets/wow/tiers/pvp_rare_artwork.webp" with { type: "file" };
import pvpEpicArtwork from "./assets/wow/tiers/pvp_epic_artwork.webp" with { type: "file" };
import raidOneArtwork from "./assets/wow/tiers/raid_tier_1_artwork.webp" with { type: "file" };
import raidTwoArtwork from "./assets/wow/tiers/raid_tier_2_artwork.webp" with { type: "file" };
import raidThreeArtwork from "./assets/wow/tiers/raid_tier_3_artwork.webp" with { type: "file" };

// Shared identity data; consumers choose the color or icon they need
// Nine Classic-era WoW classes, separate from Gauntlet announcer choices
export const characterClasses = {
  Warrior: { color: "#C79C6E", icon: warriorIcon },
  Hunter: { color: "#ABD473", icon: hunterIcon },
  Rogue: { color: "#FFF569", icon: rogueIcon },
  Shaman: { color: "#0070DE", icon: shamanIcon },
  Warlock: { color: "#9482C9", icon: warlockIcon },
  Mage: { color: "#69CCF0", icon: mageIcon },
  Priest: { color: "#FFFFFF", icon: priestIcon },
  Paladin: { color: "#F58CBA", icon: paladinIcon },
  Druid: { color: "#FF7D0A", icon: druidIcon },
} as const;

// Derive valid class names from the registry so there is only one list to maintain
export type CharacterClass = keyof typeof characterClasses;

// Classic skill caps, not character levels; Artisan is the 300-cap rank
export const professionRanks = {
  Apprentice: { maxSkill: 75 },
  Journeyman: { maxSkill: 150 },
  Expert: { maxSkill: 225 },
  Artisan: { maxSkill: 300 },
} as const;

const professionIcon = (name: string) =>
  `https://render.worldofwarcraft.com/us/icons/56/${name}.jpg`;

// Icon names verified against Wowhead Classic's Apprentice profession spells
// Specialties list available choices, not a character's selected specialization
export const professions = {
  Alchemy: {
    icon: professionIcon("trade_alchemy"),
    ranks: professionRanks,
  },
  Blacksmithing: {
    icon: professionIcon("trade_blacksmithing"),
    ranks: professionRanks,
    // Master weapon specialties require Weaponsmith, not a higher skill rank
    specialties: [
      "Armorsmith",
      "Weaponsmith",
      "Master Axesmith",
      "Master Hammersmith",
      "Master Swordsmith",
    ],
  },
  Cooking: {
    icon: professionIcon("inv_misc_food_15"),
    ranks: professionRanks,
  },
  Enchanting: {
    icon: professionIcon("trade_engraving"),
    ranks: professionRanks,
  },
  Engineering: {
    icon: professionIcon("trade_engineering"),
    ranks: professionRanks,
    specialties: ["Gnomish Engineering", "Goblin Engineering"],
  },
  "First Aid": {
    icon: professionIcon("spell_holy_sealofsacrifice"),
    ranks: professionRanks,
  },
  Fishing: {
    icon: professionIcon("trade_fishing"),
    ranks: professionRanks,
  },
  Herbalism: {
    icon: professionIcon("spell_nature_naturetouchgrow"),
    ranks: professionRanks,
  },
  Leatherworking: {
    icon: professionIcon("inv_misc_armorkit_17"),
    ranks: professionRanks,
    specialties: [
      "Dragonscale Leatherworking",
      "Elemental Leatherworking",
      "Tribal Leatherworking",
    ],
  },
  Mining: {
    icon: professionIcon("trade_mining"),
    ranks: professionRanks,
  },
  Skinning: {
    icon: professionIcon("inv_misc_pelt_wolf_01"),
    ranks: professionRanks,
  },
  Tailoring: {
    icon: professionIcon("trade_tailoring"),
    ranks: professionRanks,
  },
} as const;

export type ProfessionName = keyof typeof professions;
export type ProfessionRank = keyof typeof professionRanks;
export type ProfessionSpecialty<P extends ProfessionName> =
  (typeof professions)[P] extends { specialties: readonly (infer S)[] }
    ? S
    : never;

// Framed journal art: https://wow.zamimg.com/images/wow/journal/ui-ej-lorebg-<location>.png
// Alpha padding trimmed, whole frame resized to 256px square; PvP uses visual stand-ins
export const tierArtwork = {
  "dungeon-tier-1": {
    src: dungeonOneArtwork,
    location: "Scholomance",
    source: "scholomance",
    fileDataId: 608254,
  },
  "dungeon-tier-2": {
    src: dungeonTwoArtwork,
    location: "Blackrock Depths",
    source: "blackrockdepths",
    fileDataId: 608235,
  },
  "pvp-rare": {
    src: pvpRareArtwork,
    location: "Dire Maul",
    source: "diremaul",
    fileDataId: 608239,
  },
  "pvp-epic": {
    src: pvpEpicArtwork,
    location: "Utgarde Pinnacle",
    source: "utgardepinnacle",
    fileDataId: 608266,
  },
  "raid-tier-1": {
    src: raidOneArtwork,
    location: "Molten Core",
    source: "moltencore",
    fileDataId: 1396505,
  },
  "raid-tier-2": {
    src: raidTwoArtwork,
    location: "Blackwing Lair",
    source: "blackwinglair",
    fileDataId: 1396499,
  },
  "raid-tier-3": {
    src: raidThreeArtwork,
    location: "Naxxramas",
    source: "naxxramas",
    fileDataId: 1396506,
  },
} as const;

export type ArtworkTier = keyof typeof tierArtwork;
