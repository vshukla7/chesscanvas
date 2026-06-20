import { getPixelCoords } from "./interpolate.js";

export function drawCheckOverlay(
  ctx: CanvasRenderingContext2D,
  checkState: "none" | "check" | "checkmate",
  kingSquare: string | null,
  pulseAlpha: number,
  boardSize: number,
  orientation: "white" | "black" = "white"
) {
  if (checkState === "none" || !kingSquare) return;

  const file = kingSquare.charCodeAt(0) - 97;
  const rank = parseInt(kingSquare[1], 10) - 1;

  const coords = getPixelCoords(file, rank, boardSize, orientation);
  const cx = coords.x + coords.size / 2;
  const cy = coords.y + coords.size / 2;

  ctx.save();

  if (checkState === "checkmate") {
    // Solid opaque red square fill
    ctx.fillStyle = "#f44336";
    ctx.fillRect(coords.x, coords.y, coords.size, coords.size);
  } else if (checkState === "check") {
    // Radial red gradient centered on the king's square, fading to transparent
    const radius = coords.size * 0.7;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    
    // Pulse alpha runs between 0.35 and 0.65 (computed deterministically via phase in playback)
    grad.addColorStop(0, `rgba(244, 67, 54, ${pulseAlpha})`);
    grad.addColorStop(1, "rgba(244, 67, 54, 0)");
    
    ctx.fillStyle = grad;
    ctx.fillRect(coords.x, coords.y, coords.size, coords.size);
  }

  ctx.restore();
}
