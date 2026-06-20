import { Board } from "./Board.js";
import { Engine } from "./Engine.js";
import {
  TimelineEvent,
  ResolvedPiece,
  MoveEvent,
  ArrowEvent,
  HighlightEvent,
  ResultingState,
  PieceColor,
} from "./events.js";
import { squareToCoords, easeInOutCubic } from "../render/interpolate.js";

export class Timeline {
  private engine: Engine;
  private initialBoard: Board;
  private board: Board; // Current build-time board state
  private events: TimelineEvent[] = [];
  private currentTick = 0;
  private snapshots: Map<number, { board: Board; fen: string }> = new Map();
  private totalTicks = 0;
  private finalized = false;

  private soundEnabled = true;
  private speedSetting: "normal" | "fast" = "fast";
  private resultBannerEnabled = true;
  private checkmateAnimationEnabled = true;

  constructor(engine: Engine, board: Board) {
    this.engine = engine;
    this.initialBoard = board.clone();
    this.board = board;
    // Store initial snapshot at tick 0
    this.snapshots.set(0, {
      board: this.initialBoard.clone(),
      fen: this.engine.getFen(),
    });
  }

  getEvents(): TimelineEvent[] {
    return this.events;
  }

  getBoard(): Board {
    return this.board;
  }

  getTotalTicks(): number {
    return this.finalized ? this.totalTicks : this.currentTick;
  }

  move(pieceId: string, targetSquare: string, opts?: { duration?: number; promotion?: string }): this {
    if (this.finalized) {
      console.warn("Timeline already finalized, cannot add more moves.");
      return this;
    }

    const duration = opts?.duration ?? 1.0;
    const startTick = this.currentTick;
    const endTick = startTick + duration;

    // Validate and apply move to logical board
    const res = this.engine.validateMove(pieceId, targetSquare, this.board, opts);
    if (!res.ok) {
      console.log(`move is invalid`, { piece: pieceId, to: targetSquare, reason: res.reason });
      return this;
    }

    // Capture target piece if applicable
    let isCapture = false;
    if (res.capturedPieceId) {
      this.board.setPieceSquare(res.capturedPieceId, null);
      isCapture = true;
    }

    // Update moving piece's position
    this.board.setPieceSquare(pieceId, targetSquare);

    // Apply promotion type change
    if (res.promotion) {
      this.board.promotePiece(pieceId, res.promotion);
    }

    // Check for Castling rook move
    let syntheticRookMove: MoveEvent | undefined = undefined;
    const isCastle = !!(res.flags && (res.flags.includes("k") || res.flags.includes("q")));
    if (res.flags) {
      const isWhite = pieceId.startsWith("W");
      const rank = isWhite ? "1" : "8";
      const rookColor = isWhite ? "W" : "B";

      if (res.flags.includes("k")) {
        // Kingside castling: Rook from h-file to f-file
        const rookId = `${rookColor}R2`;
        this.board.setPieceSquare(rookId, `f${rank}`);
        syntheticRookMove = {
          type: "MOVE",
          pieceId: rookId,
          from: `h${rank}`,
          to: `f${rank}`,
          startTick,
          endTick,
          isSynthetic: true,
        };
      } else if (res.flags.includes("q")) {
        // Queenside castling: Rook from a-file to d-file
        const rookId = `${rookColor}R1`;
        this.board.setPieceSquare(rookId, `d${rank}`);
        syntheticRookMove = {
          type: "MOVE",
          pieceId: rookId,
          from: `a${rank}`,
          to: `d${rank}`,
          startTick,
          endTick,
          isSynthetic: true,
        };
      }
    }

    // Add main move event
    const mainMoveEvent: MoveEvent = {
      type: "MOVE",
      pieceId,
      from: res.from!,
      to: res.to!,
      startTick,
      endTick,
      promotion: res.promotion,
      resultingState: res.resultingState,
      isCapture,
      isCastle,
    };
    this.events.push(mainMoveEvent);

    if (syntheticRookMove) {
      this.events.push(syntheticRookMove);
    }

    // Advance cursor
    this.currentTick = endTick;

    // Save snapshot at the end of this move
    this.snapshots.set(this.currentTick, {
      board: this.board.clone(),
      fen: this.engine.getFen(),
    });

    return this;
  }

  arrow(color: string, fromSquare: string, toSquare: string, opts?: { duration?: number; persist?: boolean }): this {
    if (this.finalized) return this;

    const duration = opts?.duration ?? 0.25;
    const persist = opts?.persist ?? true;
    const startTick = this.currentTick;
    const endTick = startTick + duration;

    this.events.push({
      type: "ARROW",
      color,
      from: fromSquare,
      to: toSquare,
      startTick,
      endTick,
      persist,
    });

    this.currentTick = endTick;
    this.snapshots.set(this.currentTick, {
      board: this.board.clone(),
      fen: this.engine.getFen(),
    });

    return this;
  }

  highlight(color: string, square: string, opts?: { duration?: number; persist?: boolean }): this {
    if (this.finalized) return this;

    const duration = opts?.duration ?? 0.25;
    const persist = opts?.persist ?? true;
    const startTick = this.currentTick;
    const endTick = startTick + duration;

    this.events.push({
      type: "HIGHLIGHT",
      color,
      square,
      startTick,
      endTick,
      persist,
    });

    this.currentTick = endTick;
    this.snapshots.set(this.currentTick, {
      board: this.board.clone(),
      fen: this.engine.getFen(),
    });

    return this;
  }

  clearArrows(): this {
    if (this.finalized) return this;

    this.events.push({
      type: "CLEAR_ARROWS",
      tick: this.currentTick,
    });
    return this;
  }

  clearHighlights(): this {
    if (this.finalized) return this;

    this.events.push({
      type: "CLEAR_HIGHLIGHTS",
      tick: this.currentTick,
    });
    return this;
  }

  wait(units: number): this {
    if (this.finalized) return this;

    this.currentTick += units;
    this.snapshots.set(this.currentTick, {
      board: this.board.clone(),
      fen: this.engine.getFen(),
    });

    return this;
  }

  finalize() {
    this.finalized = true;
    this.totalTicks = this.currentTick;
  }

  suggestedDurationInFrames(fps = 30, speed: "normal" | "fast" = "fast"): number {
    this.finalize();
    const tickMultiplier = speed === "fast" ? 24 : 45;
    const framesPerTick = tickMultiplier * (fps / 30);
    return Math.max(1, Math.round(this.totalTicks * framesPerTick));
  }

  playback(t: number) {
    if (!this.finalized) {
      this.finalize();
    }

    // Clamp t between 0 and 1
    const clampedT = Math.max(0, Math.min(1, t));
    const tick = clampedT * this.totalTicks;

    // 1) Find the nearest memoized snapshot before or at tick
    let snapTick = 0;
    for (const key of Array.from(this.snapshots.keys()).sort((a, b) => a - b)) {
      if (key <= tick) {
        snapTick = key;
      } else {
        break;
      }
    }

    const snap = this.snapshots.get(snapTick)!;
    const baseBoard = snap.board.clone();

    // 2) Find active events at this tick
    const activeEvents = this.events.filter(
      (e) => (e.type === "MOVE" || e.type === "ARROW" || e.type === "HIGHLIGHT") && e.startTick <= tick && tick < e.endTick
    );

    const activeMoveEvents = activeEvents.filter(
      (e): e is MoveEvent => e.type === "MOVE"
    );

    // Resolve current positions of all pieces
    const resolvedPieces: ResolvedPiece[] = baseBoard.getPieces().map((piece) => {
      // Check if this piece is currently in motion
      const movingEvent = activeMoveEvents.find((e) => e.pieceId === piece.id);

      if (movingEvent) {
        // Interpolate position
        const fromCoords = squareToCoords(movingEvent.from);
        const toCoords = squareToCoords(movingEvent.to);

        const localT = (tick - movingEvent.startTick) / (movingEvent.endTick - movingEvent.startTick);
        const easedT = easeInOutCubic(localT);

        const file = fromCoords.file + (toCoords.file - fromCoords.file) * easedT;
        const rank = fromCoords.rank + (toCoords.rank - fromCoords.rank) * easedT;

        return {
          id: piece.id,
          color: piece.color,
          type: piece.type,
          square: piece.square,
          col: file, // Keep raw file/rank for orienting at render time
          row: rank,
          alive: true, // Still alive during the move (marked captured at next snapshot boundary)
          isMoving: true,
        };
      } else {
        // Static piece
        const coords = piece.square ? squareToCoords(piece.square) : { file: 0, rank: 0 };
        return {
          id: piece.id,
          color: piece.color,
          type: piece.type,
          square: piece.square,
          col: coords.file,
          row: coords.rank,
          alive: piece.alive,
          isMoving: false,
        };
      }
    });

    // 3) Resolve overlay events
    // Resolve active arrows
    const arrows: { from: string; to: string; color: string; opacity: number }[] = [];
    // Resolve active highlights
    const highlights: { square: string; color: string; opacity: number }[] = [];

    // Gather arrows and highlights from timeline
    this.events.forEach((e) => {
      if (e.type === "ARROW") {
        if (tick >= e.startTick) {
          // Check if cleared
          const isCleared = this.events.some(
            (c) => c.type === "CLEAR_ARROWS" && c.tick > e.startTick && c.tick <= tick
          );
          const isExpired = !e.persist && tick >= e.endTick;

          if (!isCleared && !isExpired) {
            const opacity = tick < e.endTick ? (tick - e.startTick) / (e.endTick - e.startTick) : 1.0;
            arrows.push({
              from: e.from,
              to: e.to,
              color: e.color,
              opacity,
            });
          }
        }
      } else if (e.type === "HIGHLIGHT") {
        if (tick >= e.startTick) {
          // Check if cleared
          const isCleared = this.events.some(
            (c) => c.type === "CLEAR_HIGHLIGHTS" && c.tick > e.startTick && c.tick <= tick
          );
          const isExpired = !e.persist && tick >= e.endTick;

          if (!isCleared && !isExpired) {
            const opacity = tick < e.endTick ? (tick - e.startTick) / (e.endTick - e.startTick) : 1.0;
            highlights.push({
              square: e.square,
              color: e.color,
              opacity,
            });
          }
        }
      }
    });

    // Find the last completed MOVE event before tick to resolve check state and last-move highlights
    let lastMove: MoveEvent | null = null;
    this.events.forEach((e) => {
      if (e.type === "MOVE" && !e.isSynthetic && e.endTick <= tick) {
        if (!lastMove || e.endTick > lastMove.endTick) {
          lastMove = e;
        }
      }
    });

    // Resolve last move highlight overlay (two-square highlight from -> to)
    if (lastMove) {
      const lm = lastMove as MoveEvent;
      highlights.push({ square: lm.from, color: "last-move", opacity: 0.4 });
      highlights.push({ square: lm.to, color: "last-move", opacity: 0.4 });
    }

    // Resolve check / checkmate status
    let checkState: "none" | "check" | "checkmate" = "none";
    let kingSquare: string | null = null;
    let winner: PieceColor | null = null;
    let bannerAlpha = 0;
    let checkPulseVal = 0.5;
    let checkmateProgress = 0;

    if (lastMove) {
      const lm = lastMove as MoveEvent;
      const resState = lm.resultingState;

      if (resState) {
        const checkedColor = tempTurnColor(snap.fen); // Turn at that fen is the side that is checked
        kingSquare = getKingSquare(baseBoard, checkedColor);

        if (resState.checkmate) {
          checkState = "checkmate";
          winner = resState.winner;
          const checkmateTick = lm.endTick;
          // Fade-in result banner over 0.5 ticks
          bannerAlpha = Math.min(1, Math.max(0, (tick - checkmateTick) / 0.5));
          checkmateProgress = Math.min(1, Math.max(0, (tick - checkmateTick) / 1.5));
        } else if (resState.check) {
          checkState = "check";
          const checkStartTick = lm.endTick;
          const tickSinceCheck = tick - checkStartTick;
          checkPulseVal = checkPulseAlpha(tickSinceCheck);
        }
      }
    }

    return {
      pieces: resolvedPieces.filter((p) => p.alive),
      arrows,
      highlights,
      checkState,
      kingSquare,
      winner,
      bannerAlpha,
      checkPulseAlpha: checkPulseVal,
      checkmateProgress,
      fen: snap.fen,
    };
  }

  setSound(enabled: boolean) {
    this.soundEnabled = enabled;
  }
  getSound(): boolean {
    return this.soundEnabled;
  }

  setSpeed(speed: "normal" | "fast") {
    this.speedSetting = speed;
  }
  getSpeed(): "normal" | "fast" {
    return this.speedSetting;
  }

  setShowResultBanner(enabled: boolean) {
    this.resultBannerEnabled = enabled;
  }
  getShowResultBanner(): boolean {
    return this.resultBannerEnabled;
  }

  setShowCheckmateAnimation(enabled: boolean) {
    this.checkmateAnimationEnabled = enabled;
  }
  getShowCheckmateAnimation(): boolean {
    return this.checkmateAnimationEnabled;
  }
}

function tempTurnColor(fen: string): PieceColor {
  const parts = fen.split(" ");
  return parts[1] === "w" ? "w" : "b";
}

function getKingSquare(board: Board, color: PieceColor): string | null {
  const kingId = color === "w" ? "WK" : "BK";
  const king = board.getPieceById(kingId);
  return king && king.alive ? king.square : null;
}

function checkPulseAlpha(tickSinceCheckStarted: number, periodTicks = 0.6): number {
  const phase = (tickSinceCheckStarted % periodTicks) / periodTicks;
  return 0.5 + 0.15 * Math.sin(phase * Math.PI * 2);
}
