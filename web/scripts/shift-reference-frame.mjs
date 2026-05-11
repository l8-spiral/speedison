#!/usr/bin/env node
// Build a "pre-shifted" reference frame where the lifted car sits in the
// right third of the canvas, with the left two-thirds black. Used as the
// Image-to-Video start frame for chapter-stage so Luma cannot default to
// centering the subject — the composition is baked into the input.
//
// Reads:  scener/reference-frame-520.png  (car roughly centered, 1280x720)
// Writes: scener/reference-frame-520-right.png  (car positioned right third)

import sharp from "sharp";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");

const SRC = resolve(repoRoot, "scener/reference-frame-520.png");
const OUT = resolve(repoRoot, "scener/reference-frame-520-right.png");

if (!existsSync(SRC)) {
  console.error(`Source not found: ${SRC}`);
  process.exit(1);
}

const meta = await sharp(SRC).metadata();
const w = meta.width ?? 1280;
const h = meta.height ?? 720;

// Strategy:
//   • Take the centered car image and place it as-is on the RIGHT 60% of a
//     new same-size black canvas. The car body (which was around x=520 in
//     the original) lands roughly at x = (0.40 * w) + 520 = 1020 → centered
//     in the right third of the output.
//   • Scale the source down to 60% width so it physically occupies only the
//     right 60% of the frame; the left 40% becomes pitch black.

const scaledWidth = Math.round(w * 0.6);
const scaledHeight = Math.round(h * 0.6);
const leftOffset = w - scaledWidth - Math.round(w * 0.02); // 2% right margin
const topOffset = Math.round((h - scaledHeight) / 2);

const scaled = await sharp(SRC)
  .resize(scaledWidth, scaledHeight, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
  .toBuffer();

await sharp({
  create: {
    width: w,
    height: h,
    channels: 3,
    background: { r: 5, g: 5, b: 8 }, // matches noir-950
  },
})
  .composite([{ input: scaled, left: leftOffset, top: topOffset }])
  .png({ compressionLevel: 6 })
  .toFile(OUT);

console.log(`wrote ${OUT}`);
console.log(`(${w}x${h}; car scaled to ${scaledWidth}x${scaledHeight} at offset ${leftOffset},${topOffset})`);
