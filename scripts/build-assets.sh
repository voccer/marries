#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
SEGMENTS=('0 10' '18 10' '155 10' '275 10' '515 10' '735 10' '840 10' '935 10' '1015 10')
mkdir -p assets/photos/thumb assets/video assets/qr
while IFS= read -r name; do
  source="raw/photos/$name.jpg"
  [ -s "$source" ] || { echo "Missing $source" >&2; exit 1; }
  ffmpeg -nostdin -v error -y -i "$source" -map_metadata -1 -vf 'scale=1600:1600:force_original_aspect_ratio=decrease' -c:v libwebp -quality 80 "assets/photos/$name.webp"
  ffmpeg -nostdin -v error -y -i "$source" -map_metadata -1 -vf 'scale=600:600:force_original_aspect_ratio=decrease' -c:v libwebp -quality 80 "assets/photos/thumb/$name.webp"
done < assets/photos/manifest.txt
# Mỗi đoạn được làm mờ hình và tiếng ở hai đầu trước khi nối.
tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT
files=()
for i in "${!SEGMENTS[@]}"; do
  read -r start duration <<< "${SEGMENTS[$i]}"
  file="$tmpdir/part-$i.mp4"
  ffmpeg -nostdin -v error -y -ss "$start" -t "$duration" -i raw/video/LINH-DUC.mp4 -vf "scale=-2:720,format=yuv420p,fade=t=in:st=0:d=0.4:color=white,fade=t=out:st=9.6:d=0.4:color=white" -af 'afade=t=in:st=0:d=0.4,afade=t=out:st=9.6:d=0.4' -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 128k -movflags +faststart "$file"
  printf "file '%s'\n" "$file" >> "$tmpdir/list.txt"
done
ffmpeg -nostdin -v error -y -f concat -safe 0 -i "$tmpdir/list.txt" -c copy -movflags +faststart assets/video/highlight.mp4
ffmpeg -nostdin -v error -y -ss 1 -i assets/video/highlight.mp4 -frames:v 1 -c:v libwebp -quality 82 assets/video/poster.webp
# Viền trắng giữ khoảng trống cần thiết quanh mã QR.
ffmpeg -nostdin -v error -y -i qr/Title_1795620036369.jpg -vf 'crop=810:814:196:528,pad=882:882:36:34:white,scale=600:600:flags=neighbor' -c:v libwebp -lossless 1 assets/qr/duc.webp
ffmpeg -nostdin -v error -y -i qr/IMG_1795620037683_1795620099653.jpg -vf 'crop=508:515:333:749,pad=572:579:32:32:white,scale=600:600:flags=neighbor' -c:v libwebp -lossless 1 assets/qr/linh.webp
hero=$(head -n 1 assets/photos/manifest.txt)
ffmpeg -nostdin -v error -y -i "raw/photos/$hero.jpg" -vf 'scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630' -q:v 3 assets/og.jpg
ffmpeg -nostdin -v error -y -i raw/music/canon-in-d.mp3 -map_metadata -1 -c:a libmp3lame -b:a 80k assets/music.mp3
echo 'Built wedding assets.'
