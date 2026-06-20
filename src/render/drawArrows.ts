import { getPixelCoords } from "./interpolate.js";

export interface ArrowItem {
  from: string;
  to: string;
  color: string;
  opacity: number;
}

const arrowColorMap: Record<string, string> = {
  red: "rgba(244, 67, 54, 0.8)",
  green: "rgba(76, 175, 80, 0.8)",
  blue: "rgba(33, 150, 243, 0.8)",
  yellow: "rgba(255, 235, 59, 0.8)",
};

export function drawArrows(
  ctx: CanvasRenderingContext2D,
  arrows: ArrowItem[],
  boardSize: number,
  orientation: "white" | "black" = "white"
) {
  const cell = boardSize / 8;

  for (const a of arrows) {
    const fromCoords = getPixelCoords(
      a.from.charCodeAt(0) - 97,
      parseInt(a.from[1], 10) - 1,
      boardSize,
      orientation
    );
    const toCoords = getPixelCoords(
      a.to.charCodeAt(0) - 97,
      parseInt(a.to[1], 10) - 1,
      boardSize,
      orientation
    );

    const fromCenter = { x: fromCoords.x + cell / 2, y: fromCoords.y + cell / 2 };
    const toCenter = { x: toCoords.x + cell / 2, y: toCoords.y + cell / 2 };

    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) continue;

    const ux = dx / length;
    const uy = dy / length;

    // Perpendicular vector for arrowhead base width
    const vx = -uy;
    const vy = ux;

    // Arrow visual configurations
    const shaftWidth = cell * 0.15;
    const headLength = cell * 0.32;
    const headWidth = cell * 0.32;
    const endOffset = cell * 0.22; // Offset from target center (to avoid overlapping piece too much)

    // Calculate points
    const startX = fromCenter.x + ux * (cell * 0.15);
    const startY = fromCenter.y + uy * (cell * 0.15);

    const tipX = toCenter.x - ux * endOffset;
    const tipY = toCenter.y - uy * endOffset;

    const baseCenterX = tipX - ux * headLength;
    const baseCenterY = tipY - uy * headLength;

    const leftX = baseCenterX + vx * (headWidth / 2);
    const leftY = baseCenterY + vy * (headWidth / 2);

    const rightX = baseCenterX - vx * (headWidth / 2);
    const rightY = baseCenterY - vy * (headWidth / 2);

    // Get color
    const fillStyle = arrowColorMap[a.color] ?? a.color;

    ctx.save();
    ctx.globalAlpha = a.opacity;
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = fillStyle;
    ctx.lineWidth = shaftWidth;
    ctx.lineCap = "round";

    // 1. Draw shaft (ends at the base center of the arrowhead)
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(baseCenterX, baseCenterY);
    ctx.stroke();

    // 2. Draw arrowhead triangle
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
