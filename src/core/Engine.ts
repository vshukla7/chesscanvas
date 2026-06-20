import { Chess } from "chess.js";
import { Board } from "./Board.js";
import { PieceType, PieceColor, ResultingState } from "./events.js";

export interface ValidateMoveResult {
  ok: boolean;
  reason?: string;
  from?: string;
  to?: string;
  capturedPieceId?: string | null;
  flags?: string;
  san?: string;
  resultingState?: ResultingState;
  promotion?: PieceType;
}

export class Engine {
  private chess: Chess;

  constructor() {
    this.chess = new Chess();
  }

  reset() {
    this.chess = new Chess();
  }

  getFen(): string {
    return this.chess.fen();
  }

  getPgn(): string {
    return this.chess.pgn();
  }

  validateMove(
    pieceId: string,
    targetSquare: string,
    board: Board,
    opts?: { promotion?: string }
  ): ValidateMoveResult {
    const piece = board.getPieceById(pieceId);
    if (!piece) {
      return { ok: false, reason: `Piece ${pieceId} not found.` };
    }
    if (!piece.alive || !piece.square) {
      return { ok: false, reason: `Piece ${pieceId} is captured or not on the board.` };
    }

    const fromSquare = piece.square;
    const promotionParam = opts?.promotion ? opts.promotion.toLowerCase() : undefined;

    // Dry-run move validation on a cloned chess.js instance
    const tempChess = new Chess(this.chess.fen());
    try {
      // Validate move and execute it on the temp instance
      const moveObject = tempChess.move({
        from: fromSquare,
        to: targetSquare,
        promotion: promotionParam,
      });

      if (!moveObject) {
        return { ok: false, reason: `Illegal move from ${fromSquare} to ${targetSquare}.` };
      }

      // Check captured piece on targetSquare (or adjacent square for en passant)
      let capturedPieceId: string | null = null;
      if (moveObject.flags.includes("e")) {
        // En passant capture
        const capturedFile = targetSquare[0];
        const capturedRank = fromSquare[1]; // Captured pawn stays on the same rank as the capturing pawn was before moving
        const capturedSquare = `${capturedFile}${capturedRank}`;
        capturedPieceId = board.getPieceIdAt(capturedSquare);
      } else if (moveObject.captured) {
        // Standard capture
        capturedPieceId = board.getPieceIdAt(targetSquare);
      }

      // Perform the actual move on our primary chess instance
      this.chess.move({
        from: fromSquare,
        to: targetSquare,
        promotion: promotionParam,
      });

      const resultingState: ResultingState = {
        check: this.chess.inCheck(),
        checkmate: this.chess.isCheckmate(),
        stalemate: this.chess.isStalemate(),
        draw: this.chess.isDraw(),
        winner: this.chess.isCheckmate()
          ? (this.chess.turn() === "w" ? "b" : "w")
          : null,
      };

      return {
        ok: true,
        from: fromSquare,
        to: targetSquare,
        capturedPieceId,
        flags: moveObject.flags,
        san: moveObject.san,
        resultingState,
        promotion: promotionParam as PieceType,
      };
    } catch (err: any) {
      return {
        ok: false,
        reason: err.message || `Failed to execute move from ${fromSquare} to ${targetSquare}.`,
      };
    }
  }
}
