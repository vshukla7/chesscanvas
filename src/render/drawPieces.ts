import { ResolvedPiece } from "../core/events.js";
import { getPixelCoords } from "./interpolate.js";
import { drawRedFlag, drawCrown } from "./drawCheckmateAnimation.js";

// Helper to convert SVG markup into a browser-loadable image
export function loadPieceImage(svgString: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Support UTF-8 SVG loading. In some cases, we need to escape the SVG string.
    // If the SVG doesn't contain xmlns, let's inject it to be safe
    let processed = svgString;
    if (!processed.includes("xmlns=")) {
      processed = processed.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    const base64 = btoa(unescape(encodeURIComponent(processed)));
    img.src = `data:image/svg+xml;base64,${base64}`;

    if (img.complete) {
      resolve(img);
    } else {
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error("Failed to load piece SVG image: " + err));
    }
  });
}

export async function preloadPieceSet(
  pieceSet: Record<string, string>
): Promise<Record<string, HTMLImageElement>> {
  const keys = Object.keys(pieceSet);
  const promises = keys.map((key) =>
    loadPieceImage(pieceSet[key]).then((img) => ({ key, img }))
  );
  
  const results = await Promise.all(promises);
  const images: Record<string, HTMLImageElement> = {};
  for (const { key, img } of results) {
    images[key] = img;
  }
  return images;
}

export function drawPieces(
  ctx: CanvasRenderingContext2D,
  pieces: ResolvedPiece[],
  pieceImages: Record<string, HTMLImageElement>,
  boardSize: number,
  orientation: "white" | "black" = "white",
  checkState?: "none" | "check" | "checkmate",
  winner?: "w" | "b" | null,
  checkmateProgress?: number,
  showCheckmateAnimation?: boolean
) {
  const isCheckmate = checkState === "checkmate" && winner && showCheckmateAnimation !== false;
  const losingColor = winner === "w" ? "b" : "w";
  const progress = checkmateProgress ?? 0;

  // Sort pieces so that moving pieces are drawn last (on top of static pieces)
  const sortedPieces = [...pieces].sort((a, b) => {
    const aMoving = a.isMoving ? 1 : 0;
    const bMoving = b.isMoving ? 1 : 0;
    return aMoving - bMoving;
  });

  for (const p of sortedPieces) {
    if (!p.alive) continue;

    // Translate fractional col/row (0..7) to pixel coords
    const coords = getPixelCoords(p.col, p.row, boardSize, orientation);

    // Formulate key (e.g. 'wK', 'bP')
    const key = `${p.color}${p.type.toUpperCase()}`;
    const img = pieceImages[key];

    if (img) {
      const isLosingKing = isCheckmate && p.type === "k" && p.color === losingColor;
      const isWinningKing = isCheckmate && p.type === "k" && p.color === winner;

      if (isLosingKing) {
        // Slide downwards: slide direction is always downwards in pixel space
        // coords.y increases downwards. We shift it by up to 80% of cell size.
        const currentY = coords.y + progress * coords.size * 0.8;
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - progress);
        ctx.drawImage(img, coords.x, currentY, coords.size, coords.size);
        ctx.restore();

        // Draw red flag emerging on the original square
        drawRedFlag(ctx, coords.x, coords.y, coords.size, progress);
      } else if (isWinningKing) {
        // Draw winning king normally
        ctx.drawImage(img, coords.x, coords.y, coords.size, coords.size);
        // Draw victory crown above it
        drawCrown(ctx, coords.x, coords.y, coords.size, progress);
      } else {
        // Draw other pieces normally
        ctx.drawImage(img, coords.x, coords.y, coords.size, coords.size);
      }
    } else {
      console.warn(`Image for piece key ${key} not preloaded.`);
    }
  }
}
