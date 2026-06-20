export function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function squareToCoords(square: string): { file: number; rank: number } {
  const file = square.charCodeAt(0) - 97; // 'a' -> 0, 'h' -> 7
  const rank = parseInt(square[1], 10) - 1; // '1' -> 0, '8' -> 7
  return { file, rank };
}

export function coordsToSquare(file: number, rank: number): string {
  const f = String.fromCharCode(97 + Math.max(0, Math.min(7, Math.round(file))));
  const r = String(Math.max(1, Math.min(8, Math.round(rank) + 1)));
  return f + r;
}

export interface PixelPosition {
  x: number;
  y: number;
  size: number;
}

export function getPixelCoords(
  file: number,
  rank: number,
  boardSize: number,
  orientation: "white" | "black" = "white"
): PixelPosition {
  const cell = boardSize / 8;
  const col = orientation === "white" ? file : 7 - file;
  const row = orientation === "white" ? 7 - rank : rank;
  return {
    x: col * cell,
    y: row * cell,
    size: cell,
  };
}
