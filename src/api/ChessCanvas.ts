import { Engine } from "../core/Engine.js";
import { Board } from "../core/Board.js";
import { Timeline } from "../core/Timeline.js";

export class ChessCanvas {
  private engine: Engine;
  private board: Board;
  private timeline: Timeline;

  constructor(engine: Engine, board: Board, timeline: Timeline) {
    this.engine = engine;
    this.board = board;
    this.timeline = timeline;
  }

  move(
    pieceId: string,
    targetSquare: string,
    opts?: { duration?: number; promotion?: string }
  ): this {
    this.timeline.move(pieceId, targetSquare, opts);
    return this;
  }

  arrow(
    color: string,
    fromSquare: string,
    toSquare: string,
    opts?: { duration?: number; persist?: boolean }
  ): this {
    this.timeline.arrow(color, fromSquare, toSquare, opts);
    return this;
  }

  highlight(
    color: string,
    square: string,
    opts?: { duration?: number; persist?: boolean }
  ): this {
    this.timeline.highlight(color, square, opts);
    return this;
  }

  clearArrows(): this {
    this.timeline.clearArrows();
    return this;
  }

  clearHighlights(): this {
    this.timeline.clearHighlights();
    return this;
  }

  wait(units: number): this {
    this.timeline.wait(units);
    return this;
  }

  sound(enabled: boolean): this {
    this.timeline.setSound(enabled);
    return this;
  }

  speed(val: "normal" | "fast"): this {
    this.timeline.setSpeed(val);
    return this;
  }

  showResultBanner(enabled: boolean): this {
    this.timeline.setShowResultBanner(enabled);
    return this;
  }

  showCheckmateAnimation(enabled: boolean): this {
    this.timeline.setShowCheckmateAnimation(enabled);
    return this;
  }

  fen(): string {
    return this.engine.getFen();
  }

  pgn(): string {
    return this.engine.getPgn();
  }

  playback(t: number) {
    return this.timeline.playback(t);
  }
}
