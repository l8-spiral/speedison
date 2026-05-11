#!/usr/bin/env node
// Extract start/middle/end frames from a clip and write them as PNGs so
// Claude can verify composition without playing the video.
//
//   cd web && node scripts/inspect-clip.mjs <path-relative-to-repo-root>
//
// Outputs to: scener/_inspect/<clipname>-{start,mid,end}.png

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const repoRoot = resolve(webRoot, "..");

const inputArg = process.argv[2];
if (!inputArg) { console.error("Usage: node scripts/inspect-clip.mjs <input>"); process.exit(1); }
const input = resolve(repoRoot, inputArg);
if (!existsSync(input)) { console.error(`Not found: ${input}`); process.exit(1); }

const stem = basename(input, extname(input));
const outDir = resolve(repoRoot, "scener", "_inspect");
mkdirSync(outDir, { recursive: true });

// Read duration via ffprobe-like call to ffmpeg (we don't have ffprobe but ffmpeg -i gives us info on stderr)
const probe = spawnSync(ffmpegInstaller.path, ["-i", input], { encoding: "utf8" });
const durMatch = /Duration:\s*(\d+):(\d+):(\d+\.\d+)/.exec(probe.stderr ?? "");
const dur = durMatch ? Number(durMatch[1]) * 3600 + Number(durMatch[2]) * 60 + Number(durMatch[3]) : 5;
console.log(`Duration: ~${dur.toFixed(2)}s`);

const targets = [
  { label: "start", t: 0.1 },
  { label: "mid",   t: dur / 2 },
  { label: "end",   t: Math.max(0, dur - 0.1) },
];

for (const { label, t } of targets) {
  const out = resolve(outDir, `${stem}-${label}.png`);
  const r = spawnSync(
    ffmpegInstaller.path,
    ["-y", "-ss", t.toFixed(2), "-i", input, "-frames:v", "1", "-q:v", "2", out],
    { stdio: ["ignore", "ignore", "ignore"] }
  );
  if (r.status !== 0) { console.error(`Failed extracting ${label} frame`); continue; }
  console.log(`wrote ${out}`);
}
