#!/usr/bin/env node
// Generate procedural placeholder audio for the SoundToggle (engine rumble
// loop + UI click). Uses the bundled @ffmpeg-installer/ffmpeg binary so no
// system install is required.
//
// Replace these files with real recordings when available.
//
//   cd web && node scripts/generate-audio.mjs

import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const audioDir = resolve(webRoot, "public/audio");
mkdirSync(audioDir, { recursive: true });

function run(args, label) {
  console.log(`→ ${label}`);
  const r = spawnSync(ffmpegInstaller.path, ["-y", ...args], {
    stdio: ["ignore", "ignore", "inherit"],
  });
  if (r.status !== 0) {
    console.error(`ffmpeg failed for ${label} (exit ${r.status})`);
    process.exit(1);
  }
}

// 1. Engine rumble — 8-second loopable low-frequency drone built from
//    a 55 Hz sine with light tremolo, mixed with low-passed pink noise.
//    The fade-out matches a fade-in at the start so it loops seamlessly.
const engineOut = resolve(audioDir, "engine-rev.mp3");
run(
  [
    "-f", "lavfi", "-t", "8", "-i", "sine=frequency=55:sample_rate=44100",
    "-f", "lavfi", "-t", "8", "-i", "anoisesrc=color=pink:amplitude=0.25:sample_rate=44100",
    "-filter_complex",
      // Mild vibrato on the sine, low-pass the noise, mix and shape envelope
      "[0:a]vibrato=f=4:d=0.05[s];" +
      "[1:a]lowpass=f=350,volume=0.45[n];" +
      "[s][n]amix=inputs=2:duration=first[mix];" +
      "[mix]volume=0.7,afade=t=in:st=0:d=0.6,afade=t=out:st=7.4:d=0.6[a]",
    "-map", "[a]",
    "-c:a", "libmp3lame", "-q:a", "5", "-ar", "44100", "-ac", "2",
    engineOut,
  ],
  `engine-rev.mp3 (8s low-frequency drone)`
);

// 2. Click thunk — 150 ms percussive transient: a damped 220 Hz sine with a
//    sharp attack envelope.
const clickOut = resolve(audioDir, "click-thunk.mp3");
run(
  [
    "-f", "lavfi", "-t", "0.15", "-i", "sine=frequency=220:sample_rate=44100",
    "-filter_complex",
      "[0:a]volume=0.6,afade=t=in:st=0:d=0.005,afade=t=out:st=0.02:d=0.13[a]",
    "-map", "[a]",
    "-c:a", "libmp3lame", "-q:a", "4", "-ar", "44100", "-ac", "2",
    clickOut,
  ],
  `click-thunk.mp3 (150 ms transient)`
);

console.log("Done.");
console.log(`  engine-rev.mp3 → ${engineOut}`);
console.log(`  click-thunk.mp3 → ${clickOut}`);
