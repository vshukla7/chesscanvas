import React, { useRef, useEffect, useState } from "react";
import { delayRender, continueRender, useVideoConfig, Audio, Sequence } from "remotion";
import { Timeline } from "../core/Timeline.js";
import { useChessPlayback } from "./useChessPlayback.js";
import { drawBoard } from "../render/drawBoard.js";
import { drawHighlights } from "../render/drawHighlights.js";
import { drawArrows } from "../render/drawArrows.js";
import { drawPieces, preloadPieceSet } from "../render/drawPieces.js";
import { drawCheckOverlay } from "../render/drawCheckOverlay.js";
import { pieceSets } from "../pieceSets/index.js";

export interface ChessCanvasComponentProps {
  timeline: Timeline;
  boardTheme?: string;
  pieceSet?: string | Record<string, string>;
  showResultBanner?: boolean;
  orientation?: "white" | "black";
  sound?: boolean;
  speed?: "normal" | "fast";
  showCheckmateAnimation?: boolean;
}

export function ChessCanvasComponent({
  timeline,
  boardTheme = "classic",
  pieceSet = "cburnett",
  showResultBanner = true,
  orientation = "white",
  sound = true,
  speed = "fast",
  showCheckmateAnimation = true,
}: ChessCanvasComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { width, height } = useVideoConfig();
  const { t, state } = useChessPlayback(timeline);

  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Resolve current pieceSet SVGs
  const currentSetData = typeof pieceSet === "string" 
    ? (pieceSets[pieceSet] ?? pieceSets.cburnett)
    : pieceSet;

  // Manage asset preloading with Remotion's delayRender
  useEffect(() => {
    const handle = delayRender("ChessCanvas piece set preloading");
    
    preloadPieceSet(currentSetData)
      .then((images) => {
        setLoadedImages(images);
        continueRender(handle);
      })
      .catch((err) => {
        console.error("Failed to preload piece set:", err);
        setLoadError(err.message);
        continueRender(handle);
      });
  }, [pieceSet]);

  // Execute Canvas Drawing
  useEffect(() => {
    if (!canvasRef.current || !loadedImages) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Use smaller of width/height to make board square and center it if necessary
    const boardSize = Math.min(width, height);
    const offsetX = (width - boardSize) / 2;
    const offsetY = (height - boardSize) / 2;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // 1. Draw board background grid & labels
    drawBoard(ctx, boardTheme, boardSize, orientation);

    // 2. Draw square highlights (including last-move overlays) under pieces
    drawHighlights(ctx, state.highlights, boardTheme, boardSize, orientation);

    // 3. Draw pulsing check or solid checkmate overlays under pieces
    drawCheckOverlay(ctx, state.checkState, state.kingSquare, state.checkPulseAlpha, boardSize, orientation);

    // 4. Draw arrows on top of board / highlights
    drawArrows(ctx, state.arrows, boardSize, orientation);

    // 5. Draw piece sprites at their positions
    drawPieces(
      ctx,
      state.pieces,
      loadedImages,
      boardSize,
      orientation,
      state.checkState,
      state.winner,
      state.checkmateProgress,
      showCheckmateAnimation
    );

    ctx.restore();
  }, [t, boardTheme, loadedImages, width, height, orientation, state, showCheckmateAnimation]);

  if (loadError) {
    return (
      <div style={{ color: "red", padding: 20, fontFamily: "sans-serif" }}>
        Error loading piece set: {loadError}
      </div>
    );
  }

  const resultMessage = state.winner === "w"
    ? "White wins by checkmate"
    : state.winner === "b"
    ? "Black wins by checkmate"
    : "Draw";

  return (
    <div style={{ position: "relative", width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: "block" }}
      />
      {showResultBanner && state.checkState === "checkmate" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(10, 10, 10, 0.9)",
              color: "#ffffff",
              padding: "24px 48px",
              borderRadius: "16px",
              fontSize: "42px",
              fontWeight: "bold",
              opacity: state.bannerAlpha,
              transform: `scale(${0.9 + 0.1 * state.bannerAlpha})`,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(8px)",
              fontFamily: "'Outfit', 'Inter', sans-serif",
              textAlign: "center",
              letterSpacing: "0.5px",
            }}
          >
            {resultMessage}
          </div>
        </div>
      )}
      {sound && renderSoundSequences(timeline, speed)}
    </div>
  );
}

function renderSoundSequences(timeline: Timeline, speed: "normal" | "fast") {
  const events = timeline.getEvents();
  const fps = 30; // standard FPS in test-player
  const tickMultiplier = speed === "fast" ? 24 : 45;
  const framesPerTick = tickMultiplier * (fps / 30);

  const CHESS_SFX = {
    move: "/sounds/move.mp3",
    capture: "/sounds/capture.mp3",
    check: "/sounds/check.mp3",
    castle: "/sounds/castle.mp3",
    promote: "/sounds/promote.mp3",
    checkmate: "/sounds/checkmate.mp3",
  };

  return events.map((e, index) => {
    if (e.type !== "MOVE" || e.isSynthetic) return null;

    // Play sound when the piece lands (at endTick)
    const playFrame = Math.round(e.endTick * framesPerTick);

    // Determine sound URL
    let src = CHESS_SFX.move;
    if (e.resultingState?.checkmate) {
      src = CHESS_SFX.checkmate;
    } else if (e.resultingState?.check) {
      src = CHESS_SFX.check;
    } else if (e.promotion) {
      src = CHESS_SFX.promote;
    } else if (e.isCastle) {
      src = CHESS_SFX.castle;
    } else if (e.isCapture) {
      src = CHESS_SFX.capture;
    }

    return (
      <Sequence key={`sfx-${index}`} from={playFrame}>
        <Audio src={src} volume={0.8} />
      </Sequence>
    );
  });
}
