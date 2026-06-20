import { describe, it, expect } from "vitest";
import { Engine } from "../src/core/Engine.js";
import { Board } from "../src/core/Board.js";
import { Timeline } from "../src/core/Timeline.js";

describe("Timeline Event Playback", () => {
  it("should interpolate position smoothly during a move", () => {
    const engine = new Engine();
    const board = new Board();
    const timeline = new Timeline(engine, board);

    // Play 1. e4 (WP5 from e2 -> e4, weight 1.0)
    timeline.move("WP5", "e4");
    timeline.finalize();

    expect(timeline.getTotalTicks()).toBe(1.0);

    // Playback at t = 0.0 (start of move)
    const stateStart = timeline.playback(0.0);
    const pieceStart = stateStart.pieces.find((p) => p.id === "WP5");
    expect(pieceStart?.col).toBe(4); // e-file is 4
    expect(pieceStart?.row).toBe(1); // 2-rank is 1

    // Playback at t = 0.5 (mid-flight)
    const stateMid = timeline.playback(0.5);
    const pieceMid = stateMid.pieces.find((p) => p.id === "WP5");
    expect(pieceMid?.col).toBe(4);
    expect(pieceMid?.row).toBeGreaterThan(1);
    expect(pieceMid?.row).toBeLessThan(3);

    // Playback at t = 1.0 (end of move)
    const stateEnd = timeline.playback(1.0);
    const pieceEnd = stateEnd.pieces.find((p) => p.id === "WP5");
    expect(pieceEnd?.col).toBe(4);
    expect(pieceEnd?.row).toBe(3); // e4 -> e-file is 4, 4-rank is 3
  });

  it("should handle transient and persisting arrows/highlights", () => {
    const engine = new Engine();
    const board = new Board();
    const timeline = new Timeline(engine, board);

    // 1. e4 (ticks 0 -> 1)
    timeline.move("WP5", "e4");

    // 2. Draw transient highlight (yellow, e4, duration 0.5, persist: false) (ticks 1.0 -> 1.5)
    timeline.highlight("yellow", "e4", { duration: 0.5, persist: false });

    // 3. Draw persisting arrow (red, e4 -> e5) (ticks 1.5 -> 1.75)
    timeline.arrow("red", "e4", "e5", { duration: 0.25, persist: true });

    timeline.finalize();
    const total = timeline.getTotalTicks();
    expect(total).toBe(1.75);

    // Playback at t = 0.5 (tick 0.875) -> no highlights or arrows yet
    const stateBefore = timeline.playback(0.875 / total);
    expect(stateBefore.highlights.length).toBe(0); // first move not completed yet
    expect(stateBefore.arrows.length).toBe(0);

    // Playback at t = 0.7 (tick 1.225) -> transient highlight is active
    const stateHighlight = timeline.playback(1.225 / total);
    expect(stateHighlight.highlights.some((h) => h.square === "e4" && h.color === "yellow")).toBe(true);

    // Playback at t = 0.95 (tick 1.66) -> transient highlight is expired, persisting arrow is active
    const stateArrow = timeline.playback(1.66 / total);
    // e4 highlight is expired (not in highlights)
    expect(stateArrow.highlights.some((h) => h.color === "yellow")).toBe(false);
    // red arrow is active
    expect(stateArrow.arrows.some((a) => a.color === "red" && a.from === "e4" && a.to === "e5")).toBe(true);
  });
});
