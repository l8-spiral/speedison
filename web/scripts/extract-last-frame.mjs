#!/usr/bin/env node
// Extract the very last frame of a video as a PNG for chaining into the
// next Luma generation. Writes to scener/_chain/<name>.png.
//
//   cd web && node scripts/extract-last-frame.mjs <input> [output-name]
//
//   <input>        path relative to repo root (e.g. scener/chapter-stage-16x9.mp4)
//   [output-name]  base name (no extension) for the PNG. If omitted, derived
//                  from the input filename: chapter-stage-16x9.mp4 → after-stage-16x9

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const repoRoot = resolve(webRoot, "..");

const inputArg = process.argv[2];
const nameArg = process.argv[3];
if (!inputArg) {
  console.error("Usage: node scripts/extract-last-frame.mjs <input> [output-name]");
  process.exit(1);
}
const input = resolve(repoRoot, inputArg);
if (!existsSync(input)) {
  console.error(`Not found: ${input}`);
  process.exit(1);
}

const stem = basename(input, extname(input));
// chapter-stage-16x9 → after-stage-16x9 (default chain naming)
const derivedName = stem.replace(/^chapter-/, "after-");
const outName = nameArg ?? derivedName;

const chainDir = resolve(repoRoot, "scener", "_chain");
mkdirSync(chainDir, { recursive: true });
const outPath = resolve(chainDir, `${outName}.png`);

// Probe duration so we can grab the very last frame (a small offset back
// from the absolute end works more reliably than -ss <end>).
const probe = spawnSync(ffmpegInstaller.path, ["-i", input], { encoding: "utf8" });
const durMatch = /Duration:\s*(\d+):(\d+):(\d+\.\d+)/.exec(probe.stderr ?? "");
const dur = durMatch
  ? Number(durMatch[1]) * 3600 + Number(durMatch[2]) * 60 + Number(durMatch[3])
  : 5;

// Step back ~0.1s (≈ 3 frames at 30fps) from the very end. The absolute
// last frame is often blurry due to encoding artefacts in Luma's output;
// a frame slightly before the end is sharper and visually identical for
// chain-handoff purposes.
const t = Math.max(0, dur - 0.1);

const r = spawnSync(
  ffmpegInstaller.path,
  ["-y", "-ss", t.toFixed(3), "-i", input, "-frames:v", "1", "-q:v", "2", outPath],
  { stdio: ["ignore", "ignore", "pipe"] }
);
if (r.status !== 0) {
  console.error(`ffmpeg failed (exit ${r.status})`);
  console.error(r.stderr?.toString().slice(-500));
  process.exit(1);
}

console.log(`wrote ${outPath}`);
console.log(`(from ${input}, t=${t.toFixed(2)}s of ${dur.toFixed(2)}s)`);
