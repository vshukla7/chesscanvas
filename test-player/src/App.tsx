import { useState, useMemo } from "react";
import { Player } from "@remotion/player";
import { chesscanvas } from "@vshukla7/chesscanvas";

type PresetType = "scholarsMate" | "castling" | "enPassant" | "promotion";

export default function App() {
  const [preset, setPreset] = useState<PresetType>("scholarsMate");
  const [boardTheme, setBoardTheme] = useState("classic");
  const [pieceSet, setPieceSet] = useState("cburnett");
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [showResultBanner, setShowResultBanner] = useState(true);
  const [sound, setSound] = useState(true);
  const [speed, setSpeed] = useState<"normal" | "fast">("fast");

  // Initialize and run the selected script
  const canvasInstance = useMemo(() => {
    const { script, Component, timeline } = chesscanvas({
      boardTheme,
      pieceSet,
      showResultBanner,
      sound,
      speed,
    });

    if (preset === "scholarsMate") {
      script
        .move("WP5", "e4")
        .move("BP5", "e5")
        .move("WB2", "c4")
        .move("BN1", "c6")
        .move("WQ", "h5")
        .highlight("yellow", "f7")
        .arrow("red", "h5", "f7")
        .move("BN2", "f6")
        .move("WQ", "f7")
        .wait(2.0);
    } else if (preset === "castling") {
      script
        // White clears path
        .move("WP5", "e4").move("BP5", "e5")
        .move("WN2", "f3").move("BN1", "c6")
        .move("WB2", "c4").move("BB2", "c5")
        // White castles kingside
        .move("WK", "g1")
        .wait(0.5)
        // Black clears path for queenside
        .move("BP4", "d6")
        .move("WN1", "c3")
        .move("BQ", "e7")
        .move("WB1", "e3")
        .move("BB1", "e6")
        .move("WQ", "d2")
        // Black castles queenside
        .move("BK", "c8");
    } else if (preset === "enPassant") {
      script
        .move("WP5", "e4").move("BP1", "a6")
        .move("WP5", "e5").move("BP4", "d5") // Black pawn d7 -> d5
        .highlight("yellow", "d5")
        .arrow("red", "e5", "d6")
        .wait(0.5)
        // White captures black pawn via en passant (WP5 captures d5 pawn, landing on d6)
        .move("WP5", "d6")
        .wait(1.0);
    } else if (preset === "promotion") {
      script
        .move("WP7", "g4").move("BP5", "e5")
        .move("WP7", "g5").move("BP5", "e4")
        .move("WP7", "g6").move("BP5", "e3")
        .move("WP7", "f7").move("BP1", "a6")
        .wait(0.5)
        .move("WP7", "g8", { promotion: "Q" }) // white pawn WP7 on f7 captures g8 piece, promoting to Queen
        .wait(1.0);
    }

    // compile and output timeline details
    timeline.finalize();
    const duration = timeline.suggestedDurationInFrames(30, speed);

    return {
      Component,
      durationInFrames: duration,
      timeline,
    };
  }, [preset, boardTheme, pieceSet, showResultBanner, sound, speed]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-logo">
          <svg className="chess-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21H5V19H19V21ZM17 17H7V15H17V17ZM16 13.14V7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7V13.14C6.27 13.56 5 15.13 5 17H19C19 15.13 17.73 13.56 16 13.14ZM12 5C13.1 5 14 5.9 14 7H10C10 5.9 10.9 5 12 5Z" fill="currentColor"/>
          </svg>
          <h1>Chess<span>Canvas</span></h1>
        </div>
        <p className="header-tagline">Programmatic Chess Render Preview & Debug Dashboard</p>
      </header>

      <main className="main-content">
        <section className="player-section">
          <div className="player-wrapper">
            <Player
              component={canvasInstance.Component}
              inputProps={{ orientation }}
              durationInFrames={canvasInstance.durationInFrames}
              fps={30}
              compositionWidth={800}
              compositionHeight={800}
              numberOfSharedAudioTags={100}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
              controls
            />
          </div>
        </section>

        <section className="controls-section">
          <div className="card control-card">
            <h2>Composition Setup</h2>
            
            <div className="control-group">
              <label htmlFor="preset-select">Interactive Preset Script</label>
              <select
                id="preset-select"
                value={preset}
                onChange={(e) => setPreset(e.target.value as PresetType)}
              >
                <option value="scholarsMate">Scholar's Mate (Checkmate)</option>
                <option value="castling">Castling Demo (Dual Animations)</option>
                <option value="enPassant">En Passant Demo (Capture Bookkeeping)</option>
                <option value="promotion">Pawn Promotion Demo (Type Upgrades)</option>
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="theme-select">Board Theme</label>
              <select
                id="theme-select"
                value={boardTheme}
                onChange={(e) => setBoardTheme(e.target.value)}
              >
                <option value="classic">Classic (Cream & Green)</option>
                <option value="walnut">Walnut (Warm Wood tones)</option>
                <option value="tournament">Tournament (Broadcast Gray)</option>
                <option value="blue">Blue (Chess.com Blue/Gray)</option>
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="pieces-select">Piece Sprite Set</label>
              <select
                id="pieces-select"
                value={pieceSet}
                onChange={(e) => setPieceSet(e.target.value)}
              >
                <option value="cburnett">cburnett (Lichess Default)</option>
                <option value="merida">merida (Classic Outline)</option>
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="orientation-select">Board Orientation</label>
              <select
                id="orientation-select"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as "white" | "black")}
              >
                <option value="white">White POV (Standard)</option>
                <option value="black">Black POV (Flipped)</option>
              </select>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="banner-toggle"
                checked={showResultBanner}
                onChange={(e) => setShowResultBanner(e.target.checked)}
              />
              <label htmlFor="banner-toggle">Display Checkmate Result Banner</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="sound-toggle"
                checked={sound}
                onChange={(e) => setSound(e.target.checked)}
              />
              <label htmlFor="sound-toggle">Enable Chess.com Sound Effects</label>
            </div>

            <div className="control-group">
              <label htmlFor="speed-select">Animation Playback Speed</label>
              <select
                id="speed-select"
                value={speed}
                onChange={(e) => setSpeed(e.target.value as "normal" | "fast")}
              >
                <option value="normal">Normal (1.5s per move)</option>
                <option value="fast">Fast (0.8s per move)</option>
              </select>
            </div>
          </div>

          <div className="card debug-card">
            <h2>Timeline Debug Logs</h2>
            <div className="debug-stats">
              <div className="stat-item">
                <span className="stat-label">Total Duration:</span>
                <span className="stat-val">{canvasInstance.durationInFrames} frames (~{(canvasInstance.durationInFrames / 30).toFixed(1)}s)</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Abstract Timeline:</span>
                <span className="stat-val">{canvasInstance.timeline.getTotalTicks()} ticks</span>
              </div>
            </div>

            <h3>Active Events</h3>
            <div className="events-log-container">
              {canvasInstance.timeline.getEvents().map((e, index) => (
                <div key={index} className={`event-log-item event-${e.type.toLowerCase()}`}>
                  <span className="event-type">{e.type}</span>
                  {e.type === "MOVE" && (
                    <span className="event-desc">
                      <strong>{e.pieceId}</strong>: {e.from} &rarr; {e.to}
                      {e.promotion && ` (promoted to ${e.promotion.toUpperCase()})`}
                      {e.isSynthetic && " [SYNTHETIC]"}
                    </span>
                  )}
                  {e.type === "ARROW" && (
                    <span className="event-desc">
                      {e.from} &rarr; {e.to} ({e.color})
                    </span>
                  )}
                  {e.type === "HIGHLIGHT" && (
                    <span className="event-desc">
                      {e.square} ({e.color})
                    </span>
                  )}
                  <span className="event-ticks">[{e.type === "CLEAR_ARROWS" || e.type === "CLEAR_HIGHLIGHTS" ? e.tick.toFixed(2) : `${e.startTick.toFixed(2)} - ${e.endTick.toFixed(2)}`}]</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
