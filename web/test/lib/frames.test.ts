import { describe, it, expect } from "vitest";
import { TOTAL_FRAMES, ACT_RANGES, frameForProgress, actForProgress, framePath } from "@/lib/frames";

describe("frames", () => {
  it("has 538 total frames (AlmostPerfektFull.mp4 — 17.93s × 30fps)", () => {
    expect(TOTAL_FRAMES).toBe(538);
  });

  it("frameForProgress maps 0..1 to 0..537", () => {
    expect(frameForProgress(0)).toBe(0);
    expect(frameForProgress(1)).toBe(537);
    expect(frameForProgress(0.5)).toBe(269);
    expect(frameForProgress(2)).toBe(537);
    expect(frameForProgress(-1)).toBe(0);
  });

  it("ACT_RANGES partition the timeline 0–33–66–100 %", () => {
    expect(ACT_RANGES.I.from).toBe(0);
    expect(ACT_RANGES.III.to).toBe(1);
  });

  it("actForProgress returns I, II, III correctly", () => {
    expect(actForProgress(0.10)).toBe("I");
    expect(actForProgress(0.50)).toBe("II");
    expect(actForProgress(0.80)).toBe("III");
  });

  it("framePath produces zero-padded paths under /frames", () => {
    expect(framePath(720, 0)).toBe("/frames/720w/frame-000.webp");
    expect(framePath(1280, 42)).toBe("/frames/1280w/frame-042.webp");
    expect(framePath(1920, 537)).toBe("/frames/1920w/frame-537.webp");
  });
});
