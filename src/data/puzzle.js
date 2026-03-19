// ─────────────────────────────────────────────
// PUZZLE DATA — swap in your own content here!
// Each group needs: id, label, color, and 4 words
// Colors: '#F9DF6D' (yellow), '#A0C35A' (green),
//         '#B0C4EF' (blue),   '#BA81C5' (purple)
// ─────────────────────────────────────────────

export const PUZZLE_TITLE = "Gaby's Connections";

export const GROUPS = [
  {
    id: 1,
    label: "Category One",
    color: "#F9DF6D",
    difficulty: "Straightforward",
    words: ["WORD1", "WORD2", "WORD3", "WORD4"],
  },
  {
    id: 2,
    label: "Category Two",
    color: "#A0C35A",
    difficulty: "Medium",
    words: ["WORD5", "WORD6", "WORD7", "WORD8"],
  },
  {
    id: 3,
    label: "Category Three",
    color: "#B0C4EF",
    difficulty: "Tricky",
    words: ["WORD9", "WORD10", "WORD11", "WORD12"],
  },
  {
    id: 4,
    label: "Category Four",
    color: "#BA81C5",
    difficulty: "Devious",
    words: ["WORD13", "WORD14", "WORD15", "WORD16"],
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
