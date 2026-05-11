// Frame-sequence math + path generation for both the hero video and the
// per-chapter scrub videos.
//
// HERO: AlmostPerfektFull.mp4 (17.93 s × 30 fps = 538 frames), three width
// bundles at /frames/{1920,1280,720}w/frame-NNN.webp. Existing API
// (TOTAL_FRAMES, frameForProgress, actForProgress, framePath) preserved
// for backwards compatibility with the hero components.
//
// CHAPTERS: each chapter is its own 5-second clip (~150 frames). Extracted
// into /frames/<slug>-<aspect>/{1920,1280,720}w/frame-NNN.webp by
// scripts/extract-chapter-frames.mjs. The CHAPTER_SEQUENCES registry is the
// single source of truth for frame counts; update it whenever a chapter's
// video is (re)generated.

// ----------------------------------------------------------------------
// Hero (kept exactly as before)

// Matches the count produced by scripts/extract-frames.mjs on the current
// hero video (AlmostPerfektFull.mp4 — 17.93 s × 30 fps = 538). Update when
// the video changes (see docs/runbooks/hero-video-swap.md).
export const TOTAL_FRAMES = 538;

export const ACT_RANGES = {
  I: { from: 0, to: 1 / 3 },
  II: { from: 1 / 3, to: 2 / 3 },
  III: { from: 2 / 3, to: 1 },
} as const;

export type Act = keyof typeof ACT_RANGES;

export function actForProgress(p: number): Act {
  if (p < ACT_RANGES.I.to) return "I";
  if (p < ACT_RANGES.II.to) return "II";
  return "III";
}

export function framePath(width: 1920 | 1280 | 720, frameIndex: number): string {
  const idx = String(frameIndex).padStart(3, "0");
  return `/frames/${width}w/frame-${idx}.webp`;
}

// ----------------------------------------------------------------------
// Generic sequence config — used by both hero and chapters via FrameSequence.

export type FrameWidth = 1920 | 1280 | 720;

export type FrameSequenceConfig = {
  totalFrames: number;
  /** Build the public URL for a given width-bundle + zero-padded frame index. */
  pathFor: (width: FrameWidth, frameIndex: number) => string;
};

export const HERO_SEQUENCE: FrameSequenceConfig = {
  totalFrames: TOTAL_FRAMES,
  pathFor: (width, frameIndex) => framePath(width, frameIndex),
};

// ----------------------------------------------------------------------
// Chapter sequences

export type ChapterSlug = "stage" | "pops" | "emissions" | "exhaust";
export type ChapterAspect = "16x9" | "9x16";

type ChapterSequenceMap = Partial<Record<`${ChapterSlug}-${ChapterAspect}`, FrameSequenceConfig>>;

// Update the totalFrames count whenever a chapter video is (re)extracted.
// Missing entries mean "no scrub yet — fall back to <ChapterScene>".
export const CHAPTER_SEQUENCES: ChapterSequenceMap = {
  "stage-16x9": {
    totalFrames: 151,
    pathFor: (width, frameIndex) =>
      `/frames/stage-16x9/${width}w/frame-${String(frameIndex).padStart(3, "0")}.webp`,
  },
  // future entries land here as videos arrive:
  //   "stage-9x16":     { totalFrames, pathFor: ... },
  //   "pops-16x9":      { totalFrames, pathFor: ... },
  //   "pops-9x16":      { totalFrames, pathFor: ... },
  //   "emissions-16x9": { totalFrames, pathFor: ... },
  //   "emissions-9x16": { totalFrames, pathFor: ... },
  //   "exhaust-16x9":   { totalFrames, pathFor: ... },
  //   "exhaust-9x16":   { totalFrames, pathFor: ... },
};

export function getChapterSequence(
  slug: ChapterSlug,
  aspect: ChapterAspect
): FrameSequenceConfig | undefined {
  return CHAPTER_SEQUENCES[`${slug}-${aspect}`];
}

// ----------------------------------------------------------------------
// Progress → frame index (used by both hero and chapters).

export function frameForProgress(
  p: number,
  totalFrames: number = TOTAL_FRAMES
): number {
  if (p <= 0) return 0;
  if (p >= 1) return totalFrames - 1;
  return Math.round(p * (totalFrames - 1));
}
