import { useCurrentFrame, useVideoConfig } from "remotion";
import { Timeline } from "../core/Timeline.js";

export function useChessPlayback(timeline: Timeline) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = durationInFrames <= 1 ? 0 : frame / (durationInFrames - 1);
  
  return {
    t,
    state: timeline.playback(t),
  };
}
