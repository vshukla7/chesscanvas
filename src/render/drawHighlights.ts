import { getPixelCoords } from "./interpolate.js";
import { boardThemes } from "./boardThemes.js";

export interface HighlightItem {
  square: string;
  color: string;
  opacity: number;
}

const colorMap: Record<string, string> = {
  red: "rgba(244, 67, 54, 0.5)",
  green: "rgba(76, 175, 80, 0.5)",
  blue: "rgba(33, 150, 243, 0.5)",
  yellow: "rgba(255, 235, 59, 0.5)",
};

export function drawHighlights(
  ctx: CanvasRenderingContext2D,
  highlights: HighlightItem[],
  themeName: string,
  boardSize: number,
  orientation: "white" | "black" = "white"
) {
  const theme = boardThemes[themeName] ?? boardThemes.classic;

  for (const h of highlights) {
    const coords = getPixelCoords(
      h.square.charCodeAt(0) - 97,
      parseInt(h.square[1], 10) - 1,
      boardSize,
      orientation
    );

    let fillStyle = h.color;
    if (h.color === "last-move") {
      fillStyle = theme.accent;
    } else if (colorMap[h.color]) {
      // Map standard names to nice alpha-enabled colors
      fillStyle = colorMap[h.color];
    }

    ctx.save();
    // Apply opacity (multiplied by event opacity for fade-in)
    ctx.globalAlpha = h.opacity;
    ctx.fillStyle = fillStyle;
    ctx.fillRect(coords.x, coords.y, coords.size, coords.size);
    ctx.restore();
  }
}
