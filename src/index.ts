import React from "react";
import { Engine } from "./core/Engine.js";
import { Board } from "./core/Board.js";
import { Timeline } from "./core/Timeline.js";
import { ChessCanvas } from "./api/ChessCanvas.js";
import { ChessCanvasComponent, ChessCanvasComponentProps } from "./remotion/ChessCanvasComponent.js";

export interface ChessCanvasConfig {
  boardTheme?: string;
  pieceSet?: string | Record<string, string>;
  showResultBanner?: boolean;
  sound?: boolean;
  speed?: "normal" | "fast";
  showCheckmateAnimation?: boolean;
}

export function chesscanvas(config: ChessCanvasConfig = {}) {
  const engine = new Engine();
  const board = new Board();
  const timeline = new Timeline(engine, board);
  const script = new ChessCanvas(engine, board, timeline);

  const Component = (props: Partial<ChessCanvasComponentProps>) => {
    return React.createElement(ChessCanvasComponent, {
      timeline,
      boardTheme: props.boardTheme ?? config.boardTheme ?? "classic",
      pieceSet: props.pieceSet ?? config.pieceSet ?? "cburnett",
      showResultBanner: props.showResultBanner ?? config.showResultBanner ?? timeline.getShowResultBanner(),
      sound: props.sound ?? config.sound ?? timeline.getSound(),
      speed: props.speed ?? config.speed ?? timeline.getSpeed(),
      showCheckmateAnimation: props.showCheckmateAnimation ?? config.showCheckmateAnimation ?? timeline.getShowCheckmateAnimation(),
      ...props,
    });
  };

  return { script, Component, timeline };
}

export { Engine, Board, Timeline, ChessCanvas };
export { boardThemes } from "./render/boardThemes.js";
export { pieceSets, cburnettPieces, meridaPieces } from "./pieceSets/index.js";
export * from "./core/events.js";
