#!/usr/bin/env node
// Extract WebP frame-sequences from a chapter video into per-chapter
// directories so the <ChapterScrub> component can scroll-scrub them
// independently of the hero.
//
//   cd web && node scripts/extract-chapter-frames.mjs <input>
//
// Input naming convention: chapter-<slug>-<aspect>.mp4
//   chapter-stage-16x9.mp4    → web/public/frames/stage-16x9/{1920w,1280w,720w}/
//   chapter-pops-9x16.mp4     → web/public/frames/pops-9x16/{1920w,1280w,720w}/
//
// Three widths per chapter (1920w/1280w/720w) so the same per-viewport
// pick-width logic from <HeroScrub> works.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const repoRoot = resolve(webRoot, "..");

const inputArg = process.argv[2];
if (!inputArg) {
  console.error(`Usage: node scripts/extract-chapter-frames.mjs <input>`);
  console.error(`  e.g.  node scripts/extract-chapter-frames.mjs scener/chapter-stage-16x9.mp4`);
  process.exit(1);
}
const inputPath = resolve(repoRoot, inputArg);
if (!existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const inputBase = basename(inputArg, extname(inputArg)); // chapter-stage-16x9
const m = /^chapter-(.+)-(16x9|9x16)$/.exec(inputBase);
if (!m) {
  console.error(`Input filename must match 'chapter-<slug>-<16x9|9x16>.mp4', got '${inputBase}'`);
  process.exit(1);
}
const [, slug, aspect] = m;
const seqKey = `${slug}-${aspect}`;

const outBase = resolve(webRoot, "public/frames", seqKey);

// Aspect determines the resize target dimensions for each width-bundle.
// We keep three width-bundles in both aspects so the consumer (<FrameSequence>)
// can pick the same way as for the hero.
const sizes =
  aspect === "16x9"
    ? [
        { w: 1920, h: 1080, dir: "1920w" },
        { w: 1280, h: 720, dir: "1280w" },
        { w: 720, h: 405, dir: "720w" },
      ]
    : [
        // 9:16 → portrait. We size the LONG axis (height) to the bundle width
        // number so visual fidelity ranking still matches the hero convention.
        { w: 1080, h: 1920, dir: "1920w" },
        { w: 720, h: 1280, dir: "1280w" },
        { w: 405, h: 720, dir: "720w" },
      ];

if (existsSync(outBase)) rmSync(outBase, { recursive: true, force: true });
for (const { dir } of sizes) {
  mkdirSync(resolve(outBase, dir), { recursive: true });
}

console.log(`ffmpeg: ${ffmpegInstaller.path}`);
console.log(`input:  ${inputPath}`);
console.log(`output: ${outBase}  (${aspect})`);

for (const { w, h, dir } of sizes) {
  const outPattern = resolve(outBase, dir, "frame-%03d.webp");
  console.log(`\n→ extracting ${dir} (${w}x${h})...`);
  const result = spawnSync(
    ffmpegInstaller.path,
    [
      "-y",
      "-i", inputPath,
      "-vf", `fps=30,scale=${w}:${h}:flags=lanczos`,
      "-c:v", "libwebp",
      "-quality", "80",
      "-lossless", "0",
      "-pix_fmt", "yuv420p",
      outPattern,
    ],
    { stdio: ["ignore", "ignore", "inherit"] }
  );
  if (result.status !== 0) {
    console.error(`ffmpeg failed for ${dir} (exit ${result.status})`);
    process.exit(1);
  }
  const count = readdirSync(resolve(outBase, dir)).filter((f) => f.endsWith(".webp")).length;
  console.log(`  ${dir}: ${count} frames`);
}

console.log(`\nDone. Update lib/frames.ts with the new TOTAL_FRAMES count for ${seqKey} if not already registered.`);
