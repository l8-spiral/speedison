#!/usr/bin/env node
// Export frame 520 (1280w) from the existing WebP sequence as a PNG that
// Luma's web UI accepts as start-frame in Image-to-Video mode.
//
//   cd web && node scripts/export-reference-frame.mjs
//
// Writes scener/reference-frame-520.png.

import sharp from "sharp";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const repoRoot = resolve(webRoot, "..");

const SRC = resolve(webRoot, "public/frames/1280w/frame-520.webp");
const OUT = resolve(repoRoot, "scener/reference-frame-520.png");

if (!existsSync(SRC)) {
  console.error(`Source not found: ${SRC}`);
  console.error(`Run scripts/extract-frames.mjs first to produce the WebP sequence.`);
  process.exit(1);
}

await sharp(SRC).png({ compressionLevel: 6 }).toFile(OUT);
console.log(`wrote ${OUT}`);
