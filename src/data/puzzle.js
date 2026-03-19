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
    label: "How Gaby likes her martini",
    color: "#F9DF6D",
    difficulty: "Straightforward",
    words: ["DIRTY", "FILTHY", "OLIVE", "STRONG"],
  },
  {
    id: 2,
    label: "Words to describe Maynard",
    color: "#BA81C5",
    difficulty: "Devious",
    words: ["KOREAN", "BULGOGI", "MEAT", "DOG"],
  },
  {
    id: 3,
    label: "Gaby's favorite TV shows",
    color: "#B0C4EF",
    difficulty: "Tricky",
    words: ["SUPERNATURAL", "HAPPY ENDINGS", "CHOPPED", "FRIENDS"],
  },
  {
    id: 4,
    label: "Gaby's favorite foods",
    color: "#A0C35A",
    difficulty: "Medium",
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
