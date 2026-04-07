// ─────────────────────────────────────────────────────────────────
// PUZZLE DATA — swap this file for each customer order.
//
// Required changes per order:
//   PUZZLE_TITLE  — displayed at the top of the game
//   PUZZLE_ID     — unique slug used to isolate this puzzle's
//                   leaderboard scores in Firestore (no spaces,
//                   lowercase, hyphens OK, e.g. "sarahs-connections")
//   THEME         — color palette name (see themes.js for options):
//                   Default · Blush · Sage · Midnight ·
//                   Citrus · Ocean · Berry · Champagne
//   GROUPS        — four groups, each with id, label, difficulty,
//                   and exactly 4 words. Difficulty must be one of:
//                   "Straightforward" · "Medium" · "Tricky" · "Devious"
// ─────────────────────────────────────────────────────────────────

import { getThemeColor } from "./themes";

export const PUZZLE_TITLE = "Gaby's Connections";
export const PUZZLE_ID    = "gabys-connections"; // unique per customer — change this!
export const THEME        = "Default";           // theme name from themes.js

export const GROUPS = [
  {
    id: 1,
    label: "How Gaby likes her martini",
    difficulty: "Straightforward",
    color: getThemeColor(THEME, "Straightforward"),
    words: ["DIRTY", "FILTHY", "OLIVE", "STRONG"],
  },
  {
    id: 2,
    label: "Words to describe Maynard",
    difficulty: "Devious",
    color: getThemeColor(THEME, "Devious"),
    words: ["KOREAN", "BULGOGI", "MEAT", "DOG"],
  },
  {
    id: 3,
    label: "Gaby's favorite TV shows",
    difficulty: "Tricky",
    color: getThemeColor(THEME, "Tricky"),
    words: ["SUPERNATURAL", "HAPPY ENDINGS", "CHOPPED", "FRIENDS"],
  },
  {
    id: 4,
    label: "Gaby's favorite foods",
    difficulty: "Medium",
    color: getThemeColor(THEME, "Medium"),
    words: ["BREAD", "CHEESE", "KIMCHI", "GRAPES"],
  },
];

// Build a flat lookup: word → groupId
export const WORD_MAP = {};
GROUPS.forEach((group) => {
  group.words.forEach((word) => {
    WORD_MAP[word] = group.id;
  });
});

// Flat shuffled list of all 16 words for the initial board
export function getShuffledWords() {
  const all = GROUPS.flatMap((g) => g.words);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}
