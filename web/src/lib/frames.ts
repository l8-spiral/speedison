// Matches the count produced by scripts/extract-frames.mjs on the current
// hero video (15.13 s × 30 fps ≈ 454). Update when the video changes (T45).
export const TOTAL_FRAMES = 454;

export const ACT_RANGES = {
  I:   { from: 0,    to: 1 / 3 },
  II:  { from: 1 / 3, to: 2 / 3 },
  III: { from: 2 / 3, to: 1 },
} as const;

export type Act = keyof typeof ACT_RANGES;

export function frameForProgress(p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return TOTAL_FRAMES - 1;
  return Math.round(p * (TOTAL_FRAMES - 1));
}

export function actForProgress(p: number): Act {
  if (p < ACT_RANGES.I.to) return "I";
  if (p < ACT_RANGES.II.to) return "II";
  return "III";
}

export function framePath(width: 1920 | 1280 | 720, frameIndex: number): string {
  const idx = String(frameIndex).padStart(3, "0");
  return `/frames/${width}w/frame-${idx}.webp`;
}
