#!/usr/bin/env bash
# Fetches the brand logo, favicon, and customer car gallery photos
# from the existing WordPress site at https://speedison.se and writes
# them into web/public/. Run once before the new site replaces the old.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p web/public/brand web/public/gallery

BASE="https://speedison.se"

# Brand
curl -L -o web/public/brand/logo.png \
  "$BASE/wp-content/uploads/2022/11/background-1-e1669122540854.png"

# Try to download an existing favicon; if 404, fall back to logo (we generate later)
curl -L -f -o web/public/favicon.ico "$BASE/favicon.ico" \
  || cp web/public/brand/logo.png web/public/favicon.ico

# Gallery (customer cars). Pipe-separated: source path | destination filename
declare -a IMAGES=(
  "2022/11/7E80BA69-5076-45A1-8C01-6A19FBC9321C-824x1030.jpg|exhaust-closeup.jpg"
  "2022/11/45DF84B7-6F6F-4657-BA1C-8972B5CD9BED-579x1030.jpg|c63s-stage2.jpg"
  "2022/11/75C497CB-39CB-4867-8610-7EDB7C553754-1030x1030.jpg|rs6-stage1-a.jpg"
  "2022/11/136C5433-1762-40F6-BA9A-058570E3C941-1012x1030.jpg|c63s-stage1.jpg"
  "2022/11/CC3CDA8D-3241-4F39-9619-21361034BABD-1030x1030.jpg|a35-stage1-pops.jpg"
  "2022/11/BD67C316-64AE-4505-9685-FD73B9A4DEBF-1030x1030.jpg|rs6-stage1-b.jpg"
)

for entry in "${IMAGES[@]}"; do
  src="${entry%%|*}"
  dst="${entry##*|}"
  curl -L -o "web/public/gallery/$dst" "$BASE/wp-content/uploads/$src"
done

echo "Done."
ls -la web/public/brand web/public/gallery
