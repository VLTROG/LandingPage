#!/usr/bin/env bash
# Genera i poster frame e comprime i video della landing.
# Uso:  bash tools/optimize-videos.sh
# Richiede ffmpeg. Gli originali restano nella history git.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEOS="$ROOT/media/videos"
POSTERS="$ROOT/media/images/posters"
mkdir -p "$POSTERS"

NAMES="background mission bento-1 bento-3 nfc-blockchain virtual-try-on benefits"

ext_of() {
  for ext in mp4 webm; do
    [ -f "$VIDEOS/$1.$ext" ] && { echo "$ext"; return; }
  done
  return 1
}

echo "== Poster frame =="
for name in $NAMES; do
  ext="$(ext_of "$name")"
  ffmpeg -hide_banner -loglevel error -y \
    -i "$VIDEOS/$name.$ext" \
    -vframes 1 -vf "scale='min(1600,iw)':-2" -q:v 4 \
    "$POSTERS/$name.jpg"
  echo "  $name.jpg"
done

replace_if_smaller() {
  local orig="$1" new="$2"
  local os ns
  os=$(stat -f%z "$orig"); ns=$(stat -f%z "$new")
  if [ "$ns" -lt "$os" ]; then
    mv "$new" "$orig"
    echo "  $(basename "$orig"): $((os/1024))KB -> $((ns/1024))KB"
  else
    rm "$new"
    echo "  $(basename "$orig"): compressione non conveniente, originale mantenuto"
  fi
}

echo "== Compressione MP4 (H.264 crf 28) =="
for name in bento-3 nfc-blockchain benefits; do
  ffmpeg -hide_banner -loglevel error -y \
    -i "$VIDEOS/$name.mp4" \
    -c:v libx264 -crf 28 -preset slow -an -movflags +faststart \
    "$VIDEOS/$name.cmp.mp4"
  replace_if_smaller "$VIDEOS/$name.mp4" "$VIDEOS/$name.cmp.mp4"
done

echo "== Background (1280px, H.264 crf 27) =="
ffmpeg -hide_banner -loglevel error -y \
  -i "$VIDEOS/background.mp4" \
  -vf scale=1280:-2 -c:v libx264 -crf 27 -preset slow -an -movflags +faststart \
  "$VIDEOS/background.cmp.mp4"
replace_if_smaller "$VIDEOS/background.mp4" "$VIDEOS/background.cmp.mp4"

echo "== Compressione WebM (VP9 crf 32) =="
for name in mission bento-1 virtual-try-on; do
  ffmpeg -hide_banner -loglevel error -y \
    -i "$VIDEOS/$name.webm" \
    -c:v libvpx-vp9 -crf 32 -b:v 0 -row-mt 1 -an \
    "$VIDEOS/$name.cmp.webm"
  replace_if_smaller "$VIDEOS/$name.webm" "$VIDEOS/$name.cmp.webm"
done

echo "== Fatto =="
du -sh "$VIDEOS" "$POSTERS"
