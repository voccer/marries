#!/usr/bin/env bash
# Tải ảnh và video gốc từ Google Drive (thư mục công khai) vào raw/
set -euo pipefail
cd "$(dirname "$0")/.."

PHOTO_FOLDER=1J2rKrqPj2rfhhUtyKOVkxuvpxP0JAWsi
VIDEO_ID=1orYJlTj8Mo4w33qbS76eUD1iWo2PPZSN
DL="https://drive.usercontent.google.com/download?export=download&confirm=t&id="

mkdir -p raw/photos raw/video

# Lấy cặp (id, tên file) từ trang xem công khai của thư mục
curl -fsSL "https://drive.google.com/embeddedfolderview?id=$PHOTO_FOLDER" \
  | grep -oE 'file/d/[A-Za-z0-9_-]+|flip-entry-title">[^<]+' \
  | sed -E 's#file/d/##; s#flip-entry-title">##' | paste - - \
  | while IFS=$'\t' read -r id name; do
      [[ -s "raw/photos/$name" ]] || curl -fsSL -o "raw/photos/$name" "$DL$id"
    done

[[ -s raw/video/LINH-DUC.mp4 ]] || curl -fL -o raw/video/LINH-DUC.mp4 "$DL$VIDEO_ID"

count=$(find raw/photos -name '*.jpg' | wc -l)
[[ "$count" -eq 20 ]] || { echo "Expected 20 photos, got $count" >&2; exit 1; }
echo "OK: $count photos, video $(du -h raw/video/LINH-DUC.mp4 | cut -f1)"
