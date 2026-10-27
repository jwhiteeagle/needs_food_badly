import blue from "./assets/sounds/blue.wav" with { type: "file" };
import captain from "./assets/sounds/captain.wav" with { type: "file" };
import cavalier from "./assets/sounds/cavalier.wav" with { type: "file" };
import clown from "./assets/sounds/clown.wav" with { type: "file" };
import conjurer from "./assets/sounds/conjurer.wav" with { type: "file" };
import defender from "./assets/sounds/defender.wav" with { type: "file" };
import dwarf from "./assets/sounds/dwarf.wav" with { type: "file" };
import fighter from "./assets/sounds/fighter.wav" with { type: "file" };
import fool from "./assets/sounds/fool.wav" with { type: "file" };
import green from "./assets/sounds/green.wav" with { type: "file" };
import grunt from "./assets/sounds/grunt.wav" with { type: "file" };
import guard from "./assets/sounds/guard.wav" with { type: "file" };
import guardian from "./assets/sounds/guardian.wav" with { type: "file" };
import hero from "./assets/sounds/hero.wav" with { type: "file" };
import hyena from "./assets/sounds/hyena.wav" with { type: "file" };
import is_about_to_die from "./assets/sounds/is_about_to_die.wav" with { type: "file" };
import jester from "./assets/sounds/jester.wav" with { type: "file" };
import joker from "./assets/sounds/joker.wav" with { type: "file" };
import journeyman from "./assets/sounds/journeyman.wav" with { type: "file" };
import knight from "./assets/sounds/knight.wav" with { type: "file" };
import learn_how_to_block from "./assets/sounds/learn_how_to_block.wav" with { type: "file" };
import mage from "./assets/sounds/mage.wav" with { type: "file" };
import magician from "./assets/sounds/magician.wav" with { type: "file" };
import master from "./assets/sounds/master.wav" with { type: "file" };
import mercenary from "./assets/sounds/mercenary.wav" with { type: "file" };
import minotaur from "./assets/sounds/minotaur.wav" with { type: "file" };
import mongrel from "./assets/sounds/mongrel.wav" with { type: "file" };
import needs_food from "./assets/sounds/needs_food.wav" with { type: "file" };
import needs_food_badly from "./assets/sounds/needs_food_badly.wav" with { type: "file" };
import ogre from "./assets/sounds/ogre.wav" with { type: "file" };
import prankster from "./assets/sounds/prankster.wav" with { type: "file" };
import protector from "./assets/sounds/protector.wav" with { type: "file" };
import ranger from "./assets/sounds/ranger.wav" with { type: "file" };
import red from "./assets/sounds/red.wav" with { type: "file" };
import rogue from "./assets/sounds/rogue.wav" with { type: "file" };
import scout from "./assets/sounds/scout.wav" with { type: "file" };
import sorceress from "./assets/sounds/sorceress.wav" with { type: "file" };
import trickster from "./assets/sounds/trickster.wav" with { type: "file" };
import valkyrie from "./assets/sounds/valkyrie.wav" with { type: "file" };
import veteran from "./assets/sounds/veteran.wav" with { type: "file" };
import warrior from "./assets/sounds/warrior.wav" with { type: "file" };
import witch from "./assets/sounds/witch.wav" with { type: "file" };
import wizard from "./assets/sounds/wizard.wav" with { type: "file" };
import yel1 from "./assets/sounds/yel1.wav" with { type: "file" };

// Explicit file imports let Bun hash and publish only the catalog's actual assets.
export const colors = [
  { label: "Red", url: red, swatch: "red" },
  { label: "Yellow", url: yel1, swatch: "yellow" },
  { label: "Blue", url: blue, swatch: "blue" },
  { label: "Green", url: green, swatch: "green" },
];

export const classes = [
  { label: "Warrior", url: warrior, icon: "sword" },
  { label: "Wizard", url: wizard, icon: "magic" },
  { label: "Valkyrie", url: valkyrie, icon: "shield" },
  { label: "Ranger", url: ranger, icon: "bow" },
  { label: "Captain", url: captain, icon: "shield" },
  { label: "Cavalier", url: cavalier, icon: "shield" },
  { label: "Clown", url: clown, icon: "jester" },
  { label: "Conjurer", url: conjurer, icon: "magic" },
  { label: "Defender", url: defender, icon: "shield" },
  { label: "Dwarf", url: dwarf, icon: "beast" },
  { label: "Fighter", url: fighter, icon: "sword" },
  { label: "Fool", url: fool, icon: "jester" },
  { label: "Grunt", url: grunt, icon: "sword" },
  { label: "Guard", url: guard, icon: "shield" },
  { label: "Guardian", url: guardian, icon: "shield" },
  { label: "Hero", url: hero, icon: "sword" },
  { label: "Hyena", url: hyena, icon: "beast" },
  { label: "Jester", url: jester, icon: "jester" },
  { label: "Joker", url: joker, icon: "jester" },
  { label: "Journeyman", url: journeyman, icon: "sword" },
  { label: "Knight", url: knight, icon: "shield" },
  { label: "Mage", url: mage, icon: "magic" },
  { label: "Magician", url: magician, icon: "magic" },
  { label: "Master", url: master, icon: "sword" },
  { label: "Mercenary", url: mercenary, icon: "sword" },
  { label: "Minotaur", url: minotaur, icon: "beast" },
  { label: "Mongrel", url: mongrel, icon: "beast" },
  { label: "Ogre", url: ogre, icon: "beast" },
  { label: "Prankster", url: prankster, icon: "jester" },
  { label: "Protector", url: protector, icon: "shield" },
  { label: "Rogue", url: rogue, icon: "bow" },
  { label: "Scout", url: scout, icon: "bow" },
  { label: "Sorceress", url: sorceress, icon: "magic" },
  { label: "Trickster", url: trickster, icon: "jester" },
  { label: "Veteran", url: veteran, icon: "sword" },
  { label: "Witch", url: witch, icon: "magic" },
];

export const endings = [
  { label: "Needs Food Badly", url: needs_food_badly, icon: "feast" },
  { label: "Needs Food", url: needs_food, icon: "food" },
  { label: "Is About To Die", url: is_about_to_die, icon: "skull" },
  { label: "Learn How To Block", url: learn_how_to_block, icon: "shield" },
];
