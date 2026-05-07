#!/usr/bin/env node
// Resize web/public/brand/logo.png into the favicon, apple-touch, and Next.js
// icon assets. Run from the web/ directory.
//
//   cd web && node scripts/generate-icons.mjs
//
// Reads:  web/public/brand/logo.png
// Writes: web/public/apple-touch-icon.png  (180x180)
//         web/src/app/icon.png             (512x512)
//
// favicon.ico is left as-is (downloaded from the legacy site).

import sharp from "sharp";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const SOURCE = resolve(root, "public/brand/logo.png");
const TARGETS = [
  { out: "public/apple-touch-icon.png", size: 180 },
  { out: "src/app/icon.png", size: 512 },
];

if (!existsSync(SOURCE)) {
  console.error(`Missing source logo: ${SOURCE}`);
  console.error(`Run scripts/fetch-legacy-assets.sh from the repo root first.`);
  process.exit(1);
}

for (const { out, size } of TARGETS) {
  const outPath = resolve(root, out);
  mkdirSync(dirname(outPath), { recursive: true });

  // Logo source has its own aspect; fit it inside a square canvas with
  // transparent padding so the icon looks centred at small sizes.
  await sharp(SOURCE)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(`wrote ${out} (${size}x${size})`);
}

console.log("Done.");
