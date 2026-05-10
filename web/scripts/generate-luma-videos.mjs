#!/usr/bin/env node
// Generate all chapter scrub videos via Luma Dream Machine's API. Writes
// the finished MP4s straight to /scener/ with the canonical filenames so
// the rest of the pipeline (extract-frames.mjs, ChapterScrub component)
// picks them up automatically.
//
// Usage:
//   1. Put LUMA_API_KEY in web/.env (get one at https://lumalabs.ai/dream-machine/api/keys)
//   2. cd web && node scripts/generate-luma-videos.mjs
//   3. Walk away — total runtime ~5–15 min depending on Luma queue
//
// Re-runs are idempotent: clips that already exist on disk are skipped.
// To regenerate a specific clip, delete its file from /scener/ first.
//
// Notes:
// - Each clip is generated independently. If one fails, the script moves
//   on and reports a summary at the end.
// - Polling interval grows from 5s to 30s using exponential backoff.
// - Total time depends on Luma's queue; usually each clip is ready in
//   30s–3 min.

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const repoRoot = resolve(webRoot, "..");
const scenerDir = resolve(repoRoot, "scener");

// Load LUMA_API_KEY from web/.env if not already in process.env
function loadEnv() {
  if (process.env.LUMA_API_KEY) return;
  const envFile = resolve(webRoot, ".env");
  if (!existsSync(envFile)) return;
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnv();

const LUMA_API_KEY = process.env.LUMA_API_KEY;
if (!LUMA_API_KEY) {
  console.error("Missing LUMA_API_KEY — add it to web/.env or export it before running.");
  process.exit(1);
}

const LUMA_BASE = "https://api.lumalabs.ai/dream-machine/v1";

// All 9 clips — one source of truth. Adding a 10th clip = one entry here.
const CLIPS = [
  {
    filename: "chapter-stage-16x9.mp4",
    aspect_ratio: "16:9",
    prompt: `A 5-second cinematic slow dolly push-in shot of an open engine bay of a matte black performance sports car. Composition: 16:9 widescreen. The car hood and engine bay occupy the RIGHT THIRD of the frame; the LEFT TWO-THIRDS of the frame are pitch black empty space with subtle haze. The subject of the shot is the ECU module — a black rectangular electronic control unit visible on the right side of the engine bay. Camera starts roughly 2 meters back at a 3/4 front-right angle, slowly dollying forward and tightening on the ECU module by the end of the shot. The ECU's circuit board surface gradually emits a soft amber data glow as the camera arrives. Lighting: warm copper and amber rim lighting from above, deep shadows below. Atmosphere: pitch black studio background, subtle volumetric haze, fine dust particles drifting through narrow light beams. Style: premium automotive commercial cinematography, shallow depth of field, slow 24fps motion blur, hyper-realistic photographic quality. Subject does not move — only the camera moves. Do not include people, hands, mechanics, tools, text, captions, watermarks, logos, hood ornaments, license plates, or any UI overlays.`,
  },
  {
    filename: "chapter-stage-9x16.mp4",
    aspect_ratio: "9:16",
    prompt: `A 5-second cinematic slow dolly push-in shot of an open engine bay of a matte black performance sports car. Composition: 9:16 vertical portrait. The car hood and engine bay occupy the UPPER HALF of the frame; the LOWER HALF of the frame is pitch black empty space with subtle haze. The subject of the shot is the ECU module — a black rectangular electronic control unit in the engine bay. Camera tightens vertically downward toward the ECU module by the end of the shot. The ECU's circuit board surface gradually emits a soft amber data glow as the camera arrives. Lighting: warm copper and amber rim lighting from above, deep shadows below. Atmosphere: pitch black background, subtle volumetric haze, fine dust particles in light beams. Style: premium automotive commercial cinematography, shallow depth of field, slow-motion. Subject does not move — only the camera moves. Do not include people, hands, mechanics, tools, text, captions, watermarks, logos, license plates, or UI overlays.`,
  },
  {
    filename: "chapter-pops-16x9.mp4",
    aspect_ratio: "16:9",
    prompt: `A 5-second extreme cinematic close-up of twin chrome exhaust tips on the rear of a matte black performance sports car. Composition: 16:9 widescreen. The exhaust tips and rear bumper occupy the LEFT THIRD of the frame; the RIGHT TWO-THIRDS of the frame are pitch black empty space with only a faint warm glow drifting from the flames. The subject of the shot is the twin exhaust tips. Camera holds completely steady — no zoom, no dolly, no shake. Out of the exhaust tips, bright orange and yellow flames burst rhythmically in slow pulses, three to four pulses across the five seconds. Fine sparks and glowing embers fly outward and upward and dissipate into pitch black background. Heat-haze distortion shimmers around the metal exhaust tips. Polished titanium-blue heat tint patina on the metal surfaces. Lighting: high-contrast chiaroscuro from upper right, deep shadows. Style: premium automotive cinematography, hyper-detailed, shallow depth of field, slow-motion 24fps motion blur, hyper-realistic photographic quality. Do not include people, hands, mechanics, tools, text, captions, watermarks, logos, license plates, or UI overlays.`,
  },
  {
    filename: "chapter-pops-9x16.mp4",
    aspect_ratio: "9:16",
    prompt: `A 5-second extreme cinematic close-up of twin chrome exhaust tips on the rear of a matte black performance sports car. Composition: 9:16 vertical portrait. The exhaust tips occupy the UPPER THIRD of the frame; the LOWER TWO-THIRDS of the frame are pitch black empty space with only a faint warm glow drifting from the flames. The subject of the shot is the twin exhaust tips. Camera holds completely steady — no zoom, no dolly, no shake. Out of the exhaust tips, bright orange and yellow flames burst rhythmically in slow pulses, three to four pulses across the five seconds. Fine sparks and glowing embers fly upward and dissipate into pitch black background. Heat-haze distortion shimmers around the metal exhaust tips. Polished titanium-blue heat tint patina on the metal. Lighting: high-contrast chiaroscuro lighting from above, deep shadows. Style: premium automotive cinematography, hyper-detailed, shallow depth of field, slow-motion. Do not include people, hands, mechanics, tools, text, captions, watermarks, logos, license plates, or UI overlays.`,
  },
  {
    filename: "chapter-emissions-16x9.mp4",
    aspect_ratio: "16:9",
    prompt: `A 5-second cinematic slow dolly push-in shot of the underbody of a matte black performance sports car lifted on a workshop hoist, viewed from a low 3/4 angle looking up. Composition: 16:9 widescreen. The catalytic converter and emissions hardware (cylindrical catalytic converter housing, EGR valve, DPF housing, exhaust piping) are positioned in the RIGHT THIRD of the frame; the LEFT TWO-THIRDS of the frame are pitch black empty space with subtle haze. The subject of the shot is the catalytic converter housing — a polished cylindrical metal canister mounted in the exhaust line. Camera starts wide showing the lower chassis at a low 3/4 angle, then slowly pushes forward and tightens on the catalytic converter assembly by the end. Lighting: warm amber rim lighting from below highlighting the metal components against deep shadows; the catalytic converter housing has a subtle warm glow as the camera arrives. Atmosphere: pitch black background, volumetric haze, dust particles drifting through narrow light beams. Style: industrial workshop precision aesthetic, premium automotive engineering cinematography, shallow depth of field, slow-motion 24fps motion blur, hyper-realistic photographic quality. Subject does not move — only the camera moves. Do not include people, hands, mechanics, tools, lifts in the frame, text, captions, watermarks, logos, license plates, or UI overlays.`,
  },
  {
    filename: "chapter-emissions-9x16.mp4",
    aspect_ratio: "9:16",
    prompt: `A 5-second cinematic slow dolly push-in shot of the underbody of a matte black performance sports car lifted on a workshop hoist, viewed from a low angle looking up. Composition: 9:16 vertical portrait. The catalytic converter and emissions hardware are positioned in the UPPER THIRD of the frame; the LOWER TWO-THIRDS are pitch black empty space with subtle haze. The subject of the shot is the catalytic converter housing — a polished cylindrical metal canister mounted in the exhaust line. Camera pushes forward slowly, tightening on the catalytic converter assembly by the end. Lighting: warm amber rim lighting from below, deep shadows. Subtle warm glow on the catalytic converter housing as the camera arrives. Atmosphere: pitch black background, volumetric haze, dust particles. Style: industrial precision aesthetic, premium engineering cinematography, shallow depth of field, slow-motion. Subject does not move — only the camera moves. Do not include people, hands, mechanics, tools, lifts in the frame, text, captions, watermarks, logos, license plates, or UI overlays.`,
  },
  {
    filename: "chapter-exhaust-16x9.mp4",
    aspect_ratio: "16:9",
    prompt: `A 5-second cinematic slow lateral tracking shot along the full underside exhaust line of a matte black performance sports car lifted on a workshop hoist, viewed from a low side angle. Composition: 16:9 widescreen. The car body and exhaust line occupy the LEFT THIRD of the frame and run horizontally across the upper portion of that left third; the RIGHT TWO-THIRDS of the frame are pitch black empty space with subtle haze. The subject of the shot is the full exhaust system — twin chrome exhaust tips at the rear, polished mid-pipe and catback piping running forward toward the manifold. Camera moves laterally and slowly from right to left, tracking from the rear exhaust tips forward along the catback piping. The camera does not zoom and does not shake. Lighting: polished titanium-blue heat tint on the metal pipes; warm copper rim lighting from above, deep shadows below. Atmosphere: pitch black background, volumetric haze, fine dust particles drifting through narrow light beams. Style: premium automotive engineering close-up, shallow depth of field, slow-motion 24fps motion blur, hyper-realistic photographic quality. Subject does not move — only the camera tracks laterally. Do not include people, hands, mechanics, tools, lifts in the frame, text, captions, watermarks, logos, license plates, or UI overlays.`,
  },
  {
    filename: "chapter-exhaust-9x16.mp4",
    aspect_ratio: "9:16",
    prompt: `A 5-second cinematic slow lateral tracking shot along the underside exhaust line of a matte black performance sports car lifted on a workshop hoist, viewed from a low side angle. Composition: 9:16 vertical portrait. The exhaust line occupies the UPPER THIRD of the frame running horizontally across; the LOWER TWO-THIRDS are pitch black empty space with subtle haze. The subject of the shot is the full exhaust system — twin chrome exhaust tips at the rear, polished mid-pipe and catback piping running forward. Camera tracks horizontally from right to left along the exhaust line, slow and steady. The camera does not zoom and does not shake. Lighting: polished titanium-blue heat tint on the metal; warm copper rim lighting from above, deep shadows below. Atmosphere: pitch black background, volumetric haze, dust particles. Style: premium engineering close-up, shallow depth of field, slow-motion. Subject does not move — only the camera tracks laterally. Do not include people, hands, mechanics, tools, lifts in the frame, text, captions, watermarks, logos, license plates, or UI overlays.`,
  },
  {
    filename: "hero-mobile-9x16.mp4",
    aspect_ratio: "9:16",
    prompt: `A 5-second cinematic shot of a matte black performance sports car driving slowly forward into a dark luxury workshop garage through an opening industrial roll-up door, then parking on a hoist. Composition: 9:16 vertical portrait. The car is centered in the frame, viewed from a front 3/4 angle. Camera holds wide at the start showing the car centered and the open garage door behind, then slowly tilts down and pushes in as the car comes to rest. Lighting: warm amber and copper rim lighting from within the workshop, volumetric light beams streaming through the open door, polished concrete floor reflections, atmospheric haze. Style: premium automotive commercial aesthetic, shallow depth of field, 24fps cinematic motion blur, hyper-realistic photographic quality. Background: pitch black workshop interior except for warm side rim lights. Do not include people, drivers visible through the windows, hands, mechanics, tools, text, captions, watermarks, logos, or license plates.`,
  },
];

// ---- Luma API helpers ----

const headers = {
  Authorization: `Bearer ${LUMA_API_KEY}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};

async function startGeneration(clip) {
  const res = await fetch(`${LUMA_BASE}/generations/video`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt: clip.prompt,
      aspect_ratio: clip.aspect_ratio,
      model: "ray-2",
      loop: false,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Luma POST ${res.status}: ${body}`);
  }
  const data = await res.json();
  if (!data?.id) throw new Error(`Luma returned no id: ${JSON.stringify(data)}`);
  return data.id;
}

async function pollUntilDone(id) {
  // 5s, 7s, 10s, 14s, 20s, 30s, 30s, 30s ...
  let interval = 5000;
  for (let attempt = 0; attempt < 80; attempt++) {
    await new Promise((r) => setTimeout(r, interval));
    interval = Math.min(Math.round(interval * 1.4), 30000);

    const res = await fetch(`${LUMA_BASE}/generations/${id}`, { headers });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Luma GET ${res.status}: ${body}`);
    }
    const data = await res.json();
    if (data.state === "completed" || data.state === "complete") {
      const url = data?.assets?.video;
      if (!url) throw new Error(`Generation completed but no video URL: ${JSON.stringify(data)}`);
      return url;
    }
    if (data.state === "failed") {
      throw new Error(`Luma generation failed: ${data?.failure_reason ?? "(no reason)"}`);
    }
    process.stdout.write(".");
  }
  throw new Error("Luma generation timed out after polling exhausted");
}

async function downloadTo(filepath, url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${res.status} from ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(filepath, buf);
  return buf.length;
}

// ---- Driver ----

async function generateOne(clip) {
  const out = resolve(scenerDir, clip.filename);
  if (existsSync(out)) {
    const size = statSync(out).size;
    if (size > 100_000) {
      console.log(`✓ ${clip.filename} (already exists, ${formatBytes(size)} — skipping)`);
      return { ok: true, skipped: true };
    }
  }
  console.log(`→ ${clip.filename}  [${clip.aspect_ratio}]  starting...`);
  const id = await startGeneration(clip);
  console.log(`  id=${id}  polling`);
  const videoUrl = await pollUntilDone(id);
  console.log(`\n  ready, downloading`);
  const bytes = await downloadTo(out, videoUrl);
  console.log(`✓ ${clip.filename}  saved (${formatBytes(bytes)})`);
  return { ok: true };
}

function formatBytes(n) {
  if (n > 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  if (n > 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

async function main() {
  mkdirSync(scenerDir, { recursive: true });

  console.log(`Generating ${CLIPS.length} clips → ${scenerDir}`);
  console.log(`(skips files that already exist; delete a file in scener/ to regenerate)\n`);

  const results = [];
  for (const clip of CLIPS) {
    try {
      const r = await generateOne(clip);
      results.push({ filename: clip.filename, ...r });
    } catch (e) {
      console.error(`\n✗ ${clip.filename} failed: ${e.message}`);
      results.push({ filename: clip.filename, ok: false, error: e.message });
    }
  }

  console.log(`\n────────────────────────────────────────`);
  console.log(`Summary:`);
  for (const r of results) {
    const tag = r.ok ? (r.skipped ? "SKIP" : " OK ") : "FAIL";
    console.log(`  [${tag}]  ${r.filename}${r.error ? `  — ${r.error}` : ""}`);
  }
  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    console.log(`\n${failed.length}/${results.length} clip(s) failed. Re-run the script to retry — successes are skipped.`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} clips ready in ${scenerDir}.`);
  console.log(`Next: tell me they're done so I extract frames and wire ChapterScrub.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
