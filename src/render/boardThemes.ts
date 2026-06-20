export interface BoardTheme {
  light: string;
  dark: string;
  labelLight: string; // Coordinate label on light square
  labelDark: string;  // Coordinate label on dark square
  accent: string;     // Color for last-move highlights (e.g. yellow)
}

export const boardThemes: Record<string, BoardTheme> = {
  classic: {
    // Cream / forest green (Lichess green look)
    light: "#ffffdd",
    dark: "#86a666",
    labelLight: "#86a666",
    labelDark: "#ffffdd",
    accent: "rgba(247, 247, 105, 0.4)",
  },
  walnut: {
    // Warm brown wood tones (Lichess brown default)
    light: "#f0d9b5",
    dark: "#b58863",
    labelLight: "#b58863",
    labelDark: "#f0d9b5",
    accent: "rgba(247, 247, 105, 0.4)",
  },
  tournament: {
    // High-contrast grey/white broadcast style
    light: "#ececec",
    dark: "#a9a9a9",
    labelLight: "#707070",
    labelDark: "#ffffff",
    accent: "rgba(255, 215, 0, 0.4)", // gold highlight
  },
  blue: {
    // Chess.com-style cool blue/white
    light: "#dee3e6",
    dark: "#8ca2ad",
    labelLight: "#8ca2ad",
    labelDark: "#dee3e6",
    accent: "rgba(255, 255, 51, 0.35)", // yellow highlight
  },
};
