import type { ItemReference, SetReference } from "../helper-modules";

// Public catalog contract. Workshop prompts, enchant cues and source images stay private
export type SpriteCatalog = {
  src: string;
  frameSize: number;
  footBaseline: number;
  displaySize: number;
  columns: number;
  items: readonly {
    id: string;
    race: string;
    column: number;
    characterClass: string;
    set: SetReference;
    weapons: readonly ItemReference[];
  }[];
};
