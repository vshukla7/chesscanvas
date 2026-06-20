import { describe, it, expect } from "vitest";
import { Engine } from "../src/core/Engine.js";
import { Board } from "../src/core/Board.js";

describe("Engine Move Validation", () => {
  it("should validate a simple legal opening pawn move", () => {
    const engine = new Engine();
    const board = new Board();

    // White pawn on e2 is WP5
    const res = engine.validateMove("WP5", "e4", board);
    expect(res.ok).toBe(true);
    expect(res.from).toBe("e2");
    expect(res.to).toBe("e4");
    expect(res.capturedPieceId).toBeNull();
    expect(res.resultingState?.check).toBe(false);
  });

  it("should fail validation on an illegal move", () => {
    const engine = new Engine();
    const board = new Board();

    // White pawn on e2 is WP5. Cannot jump to e5.
    const res = engine.validateMove("WP5", "e5", board);
    expect(res.ok).toBe(false);
    expect(res.reason).toBeDefined();
  });

  it("should detect a standard capture", () => {
    const engine = new Engine();
    const board = new Board();

    // 1. e4 d5
    engine.validateMove("WP5", "e4", board);
    board.setPieceSquare("WP5", "e4");

    engine.validateMove("BP4", "d5", board);
    board.setPieceSquare("BP4", "d5");

    // 2. exd5 (White WP5 captures Black BP4 at d5)
    const captureRes = engine.validateMove("WP5", "d5", board);
    expect(captureRes.ok).toBe(true);
    expect(captureRes.capturedPieceId).toBe("BP4");
  });

  it("should detect castling flags and validate", () => {
    const engine = new Engine();
    const board = new Board();

    // Clear path for white kingside castling
    // 1. e4 (WP5)
    engine.validateMove("WP5", "e4", board);
    board.setPieceSquare("WP5", "e4");

    // 1... e5 (BP5)
    engine.validateMove("BP5", "e5", board);
    board.setPieceSquare("BP5", "e5");

    // 2. Nf3 (WN2)
    engine.validateMove("WN2", "f3", board);
    board.setPieceSquare("WN2", "f3");

    // 2... Nc6 (BN1)
    engine.validateMove("BN1", "c6", board);
    board.setPieceSquare("BN1", "c6");

    // 3. Bc4 (WB2)
    engine.validateMove("WB2", "c4", board);
    board.setPieceSquare("WB2", "c4");

    // 3... d6 (BP4)
    engine.validateMove("BP4", "d6", board);
    board.setPieceSquare("BP4", "d6");

    // Now attempt Kingside Castling: WK from e1 to g1
    const castleRes = engine.validateMove("WK", "g1", board);
    expect(castleRes.ok).toBe(true);
    expect(castleRes.flags).toContain("k"); // kingside castling flag
  });

  it("should track en passant capture", () => {
    const engine = new Engine();
    const board = new Board();

    // 1. e4 (WP5) h6 (BP8)
    engine.validateMove("WP5", "e4", board);
    board.setPieceSquare("WP5", "e4");
    engine.validateMove("BP8", "h6", board);
    board.setPieceSquare("BP8", "h6");

    // 2. e5 (WP5) d5 (BP4 - jumps two squares)
    engine.validateMove("WP5", "e5", board);
    board.setPieceSquare("WP5", "e5");
    engine.validateMove("BP4", "d5", board);
    board.setPieceSquare("BP4", "d5");

    // 3. exd6 (en passant - WP5 captures BP4 at d5, landing on d6)
    const epRes = engine.validateMove("WP5", "d6", board);
    expect(epRes.ok).toBe(true);
    expect(epRes.flags).toContain("e"); // en-passant flag
    expect(epRes.capturedPieceId).toBe("BP4"); // Captured piece is BP4!
  });

  it("should detect checkmate on Scholar's Mate", () => {
    const engine = new Engine();
    const board = new Board();

    // 1. e4 e5
    engine.validateMove("WP5", "e4", board);
    board.setPieceSquare("WP5", "e4");
    engine.validateMove("BP5", "e5", board);
    board.setPieceSquare("BP5", "e5");

    // 2. Bc4 Nc6
    engine.validateMove("WB2", "c4", board);
    board.setPieceSquare("WB2", "c4");
    engine.validateMove("BN1", "c6", board);
    board.setPieceSquare("BN1", "c6");

    // 3. Qh5 Nf6
    engine.validateMove("WQ", "h5", board);
    board.setPieceSquare("WQ", "h5");
    engine.validateMove("BN2", "f6", board);
    board.setPieceSquare("BN2", "f6");

    // 4. Qxf7# (WQ captures BP6 at f7 - checkmate!)
    const mateRes = engine.validateMove("WQ", "f7", board);
    expect(mateRes.ok).toBe(true);
    expect(mateRes.resultingState?.checkmate).toBe(true);
    expect(mateRes.resultingState?.winner).toBe("w");
  });
});
