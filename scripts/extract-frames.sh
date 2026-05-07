#!/usr/bin/env bash
# Usage: ./scripts/extract-frames.sh <input-video.mp4>
# Produces 450 WebP frames at three widths (1920, 1280, 720) into
# web/public/frames/{1920w,1280w,720w}/, suitable for scroll-scrub
# rendering on a HTML <canvas>.
set -euo pipefail

INPUT="${1:-}"
if [[ -z "$INPUT" ]]; then
  echo "Usage: $0 <input-video.mp4>"
  exit 1
fi
if [[ ! -f "$INPUT" ]]; then
  echo "Input file not found: $INPUT"
  exit 1
fi
if ! command -v ffmpeg >/dev/null; then
  echo "ffmpeg not found — install: https://ffmpeg.org/download.html"
  exit 1
fi

OUT_BASE="web/public/frames"
rm -rf "$OUT_BASE"
mkdir -p "$OUT_BASE/1920w" "$OUT_BASE/1280w" "$OUT_BASE/720w"

# Force 30 fps; numbering starts at 000 (3-digit pad keeps 0-449 sortable)
for size in "1920:1080:1920w" "1280:720:1280w" "720:405:720w"; do
  W="${size%%:*}"
  rest="${size#*:}"
  H="${rest%%:*}"
  DIR="${rest##*:}"
  ffmpeg -y -i "$INPUT" \
    -vf "fps=30,scale=${W}:${H}:flags=lanczos" \
    -c:v libwebp -quality 80 -lossless 0 -pix_fmt yuv420p \
    "$OUT_BASE/$DIR/frame-%03d.webp"
done

echo "Frames written to $OUT_BASE"
ls "$OUT_BASE/1920w" | head -5
echo "Total 1920w frames: $(ls $OUT_BASE/1920w | wc -l)"
