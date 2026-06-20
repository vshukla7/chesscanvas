export type PieceType = "p" | "r" | "n" | "b" | "q" | "k";
export type PieceColor = "w" | "b";

export interface ResolvedPiece {
  id: string;
  color: PieceColor;
  type: PieceType;
  square: string | null; // null if captured
  col: number; // 0-7 fractional for interpolation
  row: number; // 0-7 fractional for interpolation
  alive: boolean;
  isMoving?: boolean;
}

export interface ResultingState {
  check: boolean;
  checkmate: boolean;
  stalemate: boolean;
  draw: boolean;
  winner: PieceColor | null;
}

export interface MoveEvent {
  type: "MOVE";
  pieceId: string;
  from: string;
  to: string;
  startTick: number;
  endTick: number;
  promotion?: PieceType;
  isSynthetic?: boolean;
  resultingState?: ResultingState;
  isCapture?: boolean;
  isCastle?: boolean;
}

export interface ArrowEvent {
  type: "ARROW";
  color: string;
  from: string;
  to: string;
  startTick: number;
  endTick: number;
  persist: boolean;
}

export interface HighlightEvent {
  type: "HIGHLIGHT";
  color: string;
  square: string;
  startTick: number;
  endTick: number;
  persist: boolean;
}

export interface ClearArrowsEvent {
  type: "CLEAR_ARROWS";
  tick: number;
}

export interface ClearHighlightsEvent {
  type: "CLEAR_HIGHLIGHTS";
  tick: number;
}

export type TimelineEvent =
  | MoveEvent
  | ArrowEvent
  | HighlightEvent
  | ClearArrowsEvent
  | ClearHighlightsEvent;
