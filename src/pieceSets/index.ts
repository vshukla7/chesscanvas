import { cburnettPieces } from "./cburnett.js";
import { meridaPieces } from "./merida.js";

export const pieceSets: Record<string, Record<string, string>> = {
  cburnett: cburnettPieces,
  merida: meridaPieces,
};

export { cburnettPieces, meridaPieces };
