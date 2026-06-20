import { boardThemes } from "./boardThemes.js";

export function drawBoard(
  ctx: CanvasRenderingContext2D,
  themeName: string,
  boardSize: number,
  orientation: "white" | "black" = "white"
) {
  const theme = boardThemes[themeName] ?? boardThemes.classic;
  const cell = boardSize / 8;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      // Determine canvas column and row based on orientation
      const col = orientation === "white" ? f : 7 - f;
      const row = orientation === "white" ? 7 - r : r;

      const isLight = (f + r) % 2 !== 0; // standard a1 (f=0, r=0) is dark
      ctx.fillStyle = isLight ? theme.light : theme.dark;
      ctx.fillRect(col * cell, row * cell, cell, cell);
    }
  }

  // Draw coordinate labels inside border squares
  const fontSize = Math.max(10, Math.round(cell * 0.18));
  ctx.font = `bold ${fontSize}px "Outfit", "Inter", sans-serif`;

  for (let i = 0; i < 8; i++) {
    // 1. Draw rank labels (1-8) in the left column
    // For white orientation, left column represents file 'a' (f = 0).
    // For black orientation, left column represents file 'h' (f = 7).
    const rankNum = i + 1;
    const fIdxRank = orientation === "white" ? 0 : 7;
    const rIdxRank = i;
    const colRank = orientation === "white" ? fIdxRank : 7 - fIdxRank;
    const rowRank = orientation === "white" ? 7 - rIdxRank : rIdxRank;

    const rankIsLight = (fIdxRank + rIdxRank) % 2 !== 0;
    ctx.fillStyle = rankIsLight ? theme.labelLight : theme.labelDark;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(
      String(rankNum),
      colRank * cell + cell * 0.08,
      rowRank * cell + cell * 0.08
    );

    // 2. Draw file labels (a-h) in the bottom row
    // For white orientation, bottom row represents rank 1 (r = 0).
    // For black orientation, bottom row represents rank 8 (r = 7).
    const fileLetter = String.fromCharCode(97 + i);
    const fIdxFile = i;
    const rIdxFile = orientation === "white" ? 0 : 7;
    const colFile = orientation === "white" ? fIdxFile : 7 - fIdxFile;
    const rowFile = orientation === "white" ? 7 - rIdxFile : rIdxFile;

    const fileIsLight = (fIdxFile + rIdxFile) % 2 !== 0;
    ctx.fillStyle = fileIsLight ? theme.labelLight : theme.labelDark;
    ctx.textBaseline = "bottom";
    ctx.textAlign = "right";
    ctx.fillText(
      fileLetter,
      colFile * cell + cell - cell * 0.08,
      rowFile * cell + cell - cell * 0.08
    );
  }
}
