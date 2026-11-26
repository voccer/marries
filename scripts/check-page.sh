#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f index.html ] || { echo 'FAIL: index.html missing'; exit 1; }
for required in 'Trọng Đức & Nhật Linh' '2026-11-28T16:00+07:00' '2026-12-04T17:45+07:00' '2026-12-12T10:00+07:00' '98 Thái Thịnh' 'xã Thiên Nhẫn' '227476796' '9972388394' 'NGUYEN TRONG DUC' 'DOAN NHAT LINH' 'og:image' 'gsap@3.15.1'; do
  grep -Fq "$required" index.html || { echo "FAIL: missing $required"; exit 1; }
done
for forbidden in 'Nhật Linh & Trọng Đức' 'countdown' 'calendar'; do
  if grep -Fq "$forbidden" index.html; then echo "FAIL: forbidden $forbidden"; exit 1; fi
done
[ "$(grep -c 'class="gallery__item"' index.html)" -eq 20 ] || { echo 'FAIL: gallery count'; exit 1; }
[ "$(grep -c 'class="event-card"' index.html)" -eq 3 ] || { echo 'FAIL: event count'; exit 1; }
echo 'PASS: page copy, hooks and counts'
