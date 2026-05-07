#!/usr/bin/env node
// Cross-platform frame-extraction (Windows, macOS, Linux). Uses the bundled
// ffmpeg binary from @ffmpeg-installer/ffmpeg so no system install is
// required. Functionally equivalent to scripts/extract-frames.sh.
//
//   cd web && node scripts/extract-frames.mjs <input-video>
//
// Produces 450 WebP frames at three widths (1920, 1280, 720) into
// web/public/frames/{1920w,1280w,720w}/.
//
// On Linux CI / Railway, prefer the .sh variant if a system ffmpeg is
// already on PATH (smaller container, faster).

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const repoRoot = resolve(webRoot, "..");

const inputArg = process.argv[2];
if (!inputArg) {
  console.error(`Usage: node scripts/extract-frames.mjs <input-video>`);
  process.exit(1);
}
const inputPath = resolve(repoRoot, inputArg);
if (!existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const outBase = resolve(webRoot, "public/frames");
const sizes = [
  { w: 1920, h: 1080, dir: "1920w" },
  { w: 1280, h: 720,  dir: "1280w" },
  { w: 720,  h: 405,  dir: "720w" },
];

if (existsSync(outBase)) rmSync(outBase, { recursive: true, force: true });
for (const { dir } of sizes) {
  mkdirSync(resolve(outBase, dir), { recursive: true });
}

console.log(`ffmpeg: ${ffmpegInstaller.path} (v${ffmpegInstaller.version})`);
console.log(`input:  ${inputPath}`);

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
  const count = readdirSync(resolve(outBase, dir)).filter(f => f.endsWith(".webp")).length;
  console.log(`  ${dir}: ${count} frames`);
}

console.log(`\nDone. Frames written to ${outBase}`);
