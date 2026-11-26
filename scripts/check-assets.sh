#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
fail() { echo "FAIL: $*" >&2; exit 1; }
[ -f assets/photos/manifest.txt ] || fail 'manifest missing'
[ "$(wc -l < assets/photos/manifest.txt)" -eq 20 ] || fail 'manifest count'
for name in $(cat assets/photos/manifest.txt); do
  [ -f "assets/photos/$name.webp" ] || fail "missing photo $name"
  [ -f "assets/photos/thumb/$name.webp" ] || fail "missing thumb $name"
done
[ "$(find assets/photos -maxdepth 1 -name '*.webp' | wc -l)" -eq 20 ] || fail 'full photo count'
[ "$(find assets/photos/thumb -maxdepth 1 -name '*.webp' | wc -l)" -eq 20 ] || fail 'thumb count'
for file in assets/photos/*.webp; do [ "$(stat -c %s "$file")" -le 512000 ] || fail "oversize $file"; done
for file in assets/photos/thumb/*.webp; do [ "$(stat -c %s "$file")" -le 122880 ] || fail "oversize $file"; done
for file in assets/video/highlight.mp4 assets/video/poster.webp assets/qr/duc.webp assets/qr/linh.webp assets/og.jpg assets/music.mp3; do [ -s "$file" ] || fail "missing $file"; done
[ "$(stat -c %s assets/video/highlight.mp4)" -le 26214400 ] || fail 'video oversize'
[ "$(stat -c %s assets/music.mp3)" -le 4194304 ] || fail 'music oversize'
duration=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 assets/video/highlight.mp4)
awk -v d="$duration" 'BEGIN { exit !(d >= 75 && d <= 105) }' || fail "video duration $duration"
height=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=nw=1:nk=1 assets/video/highlight.mp4)
[ "$height" = 720 ] || fail "video height $height"
size=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 assets/og.jpg)
[ "$size" = 1200x630 ] || fail "og size $size"
echo 'PASS: assets (20 photos, 20 thumbs, video, QR, OG, music)'
