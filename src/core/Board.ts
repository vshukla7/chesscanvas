import { PieceType, PieceColor, ResolvedPiece } from "./events.js";

export interface Piece {
  id: string;
  color: PieceColor;
  type: PieceType;
  square: string | null;
  alive: boolean;
}

export class Board {
  private pieces: Map<string, Piece> = new Map();

  constructor() {
    this.reset();
  }

  reset() {
    this.pieces.clear();

    const addPiece = (id: string, color: PieceColor, type: PieceType, square: string) => {
      this.pieces.set(id, { id, color, type, square, alive: true });
    };

    // White pieces
    addPiece("WR1", "w", "r", "a1");
    addPiece("WN1", "w", "n", "b1");
    addPiece("WB1", "w", "b", "c1");
    addPiece("WQ", "w", "q", "d1");
    addPiece("WK", "w", "k", "e1");
    addPiece("WB2", "w", "b", "f1");
    addPiece("WN2", "w", "n", "g1");
    addPiece("WR2", "w", "r", "h1");

    for (let i = 1; i <= 8; i++) {
      const file = String.fromCharCode(96 + i);
      addPiece(`WP${i}`, "w", "p", `${file}2`);
    }

    // Black pieces
    addPiece("BR1", "b", "r", "a8");
    addPiece("BN1", "b", "n", "b8");
    addPiece("BB1", "b", "b", "c8");
    addPiece("BQ", "b", "q", "d8");
    addPiece("BK", "b", "k", "e8");
    addPiece("BB2", "b", "b", "f8");
    addPiece("BN2", "b", "n", "g8");
    addPiece("BR2", "b", "r", "h8");

    for (let i = 1; i <= 8; i++) {
      const file = String.fromCharCode(96 + i);
      addPiece(`BP${i}`, "b", "p", `${file}7`);
    }
  }

  getPieceById(id: string): Piece | undefined {
    return this.pieces.get(id);
  }

  getPieceIdAt(square: string): string | null {
    for (const piece of this.pieces.values()) {
      if (piece.alive && piece.square === square) {
        return piece.id;
      }
    }
    return null;
  }

  setPieceSquare(id: string, square: string | null) {
    const piece = this.pieces.get(id);
    if (piece) {
      piece.square = square;
      if (square === null) {
        piece.alive = false;
      }
    }
  }

  promotePiece(id: string, type: PieceType) {
    const piece = this.pieces.get(id);
    if (piece) {
      piece.type = type;
    }
  }

  getPieces(): Piece[] {
    return Array.from(this.pieces.values());
  }

  clone(): Board {
    const cloned = new Board();
    cloned.pieces.clear();
    for (const [id, piece] of this.pieces.entries()) {
      cloned.pieces.set(id, { ...piece });
    }
    return cloned;
  }
}
