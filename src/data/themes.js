// ─────────────────────────────────────────────────────────────────
// THEMES — map difficulty labels to hex colors.
// Default is free; the rest are paid palette options.
//
// Difficulty order (easiest → hardest):
//   Straightforward → Medium → Tricky → Devious
// ─────────────────────────────────────────────────────────────────

export const THEMES = {
  Default: {
    Straightforward: "#F9DF6D",
    Medium:          "#A0C35A",
    Tricky:          "#B0C4EF",
    Devious:         "#BA81C5",
  },
  Blush: {
    Straightforward: "#FADADD",
    Medium:          "#F4A7B9",
    Tricky:          "#E87090",
    Devious:         "#D4547A",
  },
  Sage: {
    Straightforward: "#E0F0C8",
    Medium:          "#B8DC88",
    Tricky:          "#8FC455",
    Devious:         "#7AB53E",
  },
  Midnight: {
    Straightforward: "#C5D5F0",
    Medium:          "#8FA8D8",
    Tricky:          "#9B8DC4",
    Devious:         "#7B6BAB",
  },
  Citrus: {
    Straightforward: "#FFF3A3",
    Medium:          "#FFD966",
    Tricky:          "#FFB347",
    Devious:         "#FF7C35",
  },
  Ocean: {
    Straightforward: "#CCF0F5",
    Medium:          "#7DD8E0",
    Tricky:          "#45B5C0",
    Devious:         "#2A9BA8",
  },
  Berry: {
    Straightforward: "#F3D5E8",
    Medium:          "#E4A0C0",
    Tricky:          "#C06EA0",
    Devious:         "#A04880",
  },
  Champagne: {
    Straightforward: "#FFF8E7",
    Medium:          "#F5DEB3",
    Tricky:          "#E8C88A",
    Devious:         "#C9A85C",
  },
};

// Emoji squares per difficulty — used in share text regardless of theme.
export const DIFFICULTY_EMOJIS = {
  Straightforward: "🟨",
  Medium:          "🟩",
  Tricky:          "🟦",
  Devious:         "🟪",
};

/**
 * Returns the hex color for a given theme + difficulty.
 * Falls back to Default if the theme name is unrecognized.
 */
export function getThemeColor(themeName, difficulty) {
  const theme = THEMES[themeName] ?? THEMES.Default;
  return theme[difficulty] ?? "#CCCCCC";
}
