# Hero video swap

How to replace the hero video with an updated render and re-extract its
frame sequence.

## When to run

- A new AI-generated 15-sec hero video lands in `scener/`.
- You've shot a real customer-car explosion sequence and want to swap.
- Hot-spot positions in `web/src/lib/hotspots.ts` need verification (they
  haven't been measured against the actual car positions in the current
  video — see the comment at the top of that file).

## Steps

### 1. Drop the new video into the repo

Save the source MP4 in `scener/`. The directory is gitignored so files
aren't accidentally committed (they're often hundreds of MB). If you want
the video to be available at Railway build time, see "Production source"
below.

### 2. Re-extract frames

```bash
cd web
node scripts/extract-frames.mjs ../scener/<your-video>.mp4
```

The script writes 1920w/, 1280w/, 720w/ WebP sequences into
`web/public/frames/`. Frame WebPs are gitignored (regenerated from the
source video).

If `scripts/extract-frames.sh` is preferred (Linux/Mac with system
ffmpeg), the syntax is identical:

```bash
./scripts/extract-frames.sh scener/<your-video>.mp4
```

### 3. Update `TOTAL_FRAMES`

Open `web/src/lib/frames.ts`. Change `TOTAL_FRAMES` to match the new
frame count (count files in `web/public/frames/720w/`).

```bash
ls web/public/frames/720w | wc -l
```

Update the test in `web/test/lib/frames.test.ts` to match: assertions on
`TOTAL_FRAMES`, `frameForProgress(1)`, and `framePath(...)` upper-bound
all use the count.

### 4. Update mid-frame in HeroStatic

`web/src/components/hero-scrub/HeroStatic.tsx` references a specific frame
as the static fallback for `prefers-reduced-motion`. Update the frame
index to roughly the middle of the new video (e.g. if 454 frames, use
~227).

### 5. Verify hot-spot positions

Open `web/public/frames/1280w/frame-440.webp` (or any frame near the end
of Akt III) in a browser or image viewer. For each entry in
`web/src/lib/hotspots.ts`:

- Visually identify the part on the lifted/exploded car.
- Update `x` and `y` (percentages, 0..100) so the dot lands on top of
  that part.

Then run the dev server and scroll past Akt III to confirm the hot-spots
hover correctly:

```bash
cd web
npm run dev
# open http://localhost:3000 → scroll to bottom of hero
```

### 6. Run tests + commit

```bash
cd web && npm test
git add web/src/lib/frames.ts web/test/lib/frames.test.ts \
        web/src/components/hero-scrub/HeroStatic.tsx \
        web/src/lib/hotspots.ts
git commit -m "feat(web): swap hero video to <description>; update frame count and hot-spots"
```

## Production source

Frame WebPs are gitignored because they're large (~98 MB total at three
widths for a 15-sec video). On Railway, the build container needs the
source video to extract frames during build.

Two options:

### Option A — Git LFS (recommended)

```bash
cd C:/Users/Lobos8/Projects/SPEEDISON
git lfs install
git lfs track "scener/*.mp4"
git add .gitattributes
git add scener/<your-video>.mp4
git commit -m "feat: track hero video via LFS"
```

Then add a `prebuild` script in `web/package.json`:

```json
"prebuild": "test -f public/frames/720w/frame-001.webp || (cd .. && bash scripts/extract-frames.sh scener/<your-video>.mp4)"
```

Railway's checkout pulls LFS files automatically. Frames extract during
build.

### Option B — External URL

Host the source video on Cloudflare R2 / S3 / a public URL. Set a
`VIDEO_SOURCE_URL` env var in Railway. Modify `prebuild` to download
first:

```json
"prebuild": "test -f public/frames/720w/frame-001.webp || (mkdir -p ../scener && curl -L -o ../scener/final.mp4 \"$VIDEO_SOURCE_URL\" && cd .. && bash scripts/extract-frames.sh scener/final.mp4)"
```

## ffmpeg availability on Railway

Railway's Nixpacks builder usually includes ffmpeg in the base image. If
the build fails because ffmpeg is missing, add a `nixpacks.toml` at the
repo root:

```toml
[phases.setup]
nixPkgs = ["nodejs_20", "ffmpeg"]
```

Push and re-deploy.
