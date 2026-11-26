# Thiệp cưới online — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Một trang thiệp cưới tĩnh (`wedding.voccer.net`) cho Trọng Đức & Nhật Linh: phong bì mở đầu, 3 buổi tiệc, album, video, QR mừng cưới, nhạc nền, hiệu ứng GSAP.

**Architecture:** HTML/CSS/JS thuần, không build. `index.html` chứa toàn bộ nội dung (đọc được khi không có JS); `main.js` thêm hiệu ứng. Ảnh/video gốc nằm ở `raw/` (gitignore), `scripts/build-assets.sh` sinh bản nén vào `assets/`. Vercel phục vụ thư mục gốc.

**Tech Stack:** HTML5, CSS custom properties, GSAP 3.15.1 (core + ScrollTrigger + SplitText) từ `cdn.jsdelivr.net`, Google Fonts, ffmpeg (máy local).

**Spec:** `docs/superpowers/specs/2026-11-25-wedding-site-design.md`

## Global Constraints

- **KHÔNG `git commit` / `git push`** (rule của user). Bỏ mọi bước commit; xong task thì liệt kê file đã đổi.
- Hạn: chạy được trên Vercel trước **28/11/2026**.
- Thứ tự tên mọi chỗ: **"Trọng Đức & Nhật Linh"**; dấu sáp **"Đ & L"**. Giọng văn thân mật.
- Màu: `--bg #FBF7F0`, `--ink #6B1F2A`, `--gold #B8925A`.
- Font: Great Vibes (tên), Cormorant Infant (tiêu đề), Be Vietnam Pro (nội dung) — kèm `subset` vietnamese (mặc định của css2 API).
- GSAP pin `3.15.1`: `https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/{gsap,ScrollTrigger,SplitText}.min.js`.
- Code tiếng Anh, comment tiếng Việt; nội dung hiển thị tiếng Việt (là dữ liệu).
- Không có: đếm ngược, thêm vào lịch, làm mờ buổi đã qua, RSVP, câu chuyện, tên phụ huynh.
- Không dependency npm; không `vercel.json`.

Dữ liệu cố định (copy nguyên văn):

| Buổi | `datetime` | Hiển thị | Địa điểm | Query Google Maps |
|---|---|---|---|---|
| Tiệc báo hỷ nhà gái | `2026-11-28T16:00+07:00` | 16:00 · Thứ Bảy 28/11/2026 | Yên Bái | `Yên Bái` |
| Tiệc thân mật bạn bè | `2026-12-04T17:45+07:00` | 17:45 · Thứ Sáu 04/12/2026 | Quán bia Hải Xồm, 98 Thái Thịnh, Hà Nội | `Quán bia Hải Xồm 98 Thái Thịnh Hà Nội` |
| Lễ thành hôn | `2026-12-12T10:00+07:00` | 10:00 · Thứ Bảy 12/12/2026 | Tư gia nhà trai, xóm 9, xã Thiên Nhẫn, tỉnh Nghệ An | `xã Thiên Nhẫn Nghệ An` |

Link chỉ đường: `https://www.google.com/maps/search/?api=1&query=<encodeURIComponent(query)>`.

| Người | Ngân hàng | STK | Tên TK | QR gốc |
|---|---|---|---|---|
| Chú rể | VPBank | `227476796` | NGUYEN TRONG DUC | `qr/Title_1795620036369.jpg` (1200×2390) |
| Cô dâu | Vietcombank | `9972388394` | DOAN NHAT LINH | `qr/IMG_1795620037683_1795620099653.jpg` (1170×2532) |

Drive IDs: video `1orYJlTj8Mo4w33qbS76eUD1iWo2PPZSN`; ảnh lấy danh sách ID từ
`https://drive.google.com/embeddedfolderview?id=1J2rKrqPj2rfhhUtyKOVkxuvpxP0JAWsi` (20 file `BTT_*.jpg`).
Tải: `https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t`.

## Review Focus

1. **Nhạc trên iOS Safari / webview Zalo, Messenger:** `audio.play()` phải gọi đồng bộ trong handler chạm mở phong bì; nếu promise reject thì nút nhạc ở trạng thái tắt, trang không vỡ.
2. **Sao chép STK trong in-app browser** (không có `navigator.clipboard`): fallback chọn text bằng `document.execCommand('copy')`; vẫn hiện toast. Chuỗi copy chỉ có chữ số.
3. **4G chậm:** ảnh hero `preload` + `fetchpriority="high"`, album `loading="lazy"` dùng thumb, video `preload="none"` + poster; tổng tải lần đầu (trước khi cuộn) < 1,5 MB không tính font.
4. **JS/GSAP/CDN lỗi hoặc `prefers-reduced-motion`:** mọi nội dung vẫn hiện (CSS không đặt `opacity:0` sẵn; trạng thái ẩn chỉ do JS gán). Phong bì không chặn trang khi JS không chạy.
5. **Màn hình 360–375px:** không scroll ngang (dải album pin ngang chỉ bật ≥ 768px), tên dài "Trọng Đức & Nhật Linh" không tràn.

---

### Task 1: Tài nguyên (ảnh, video, QR, nhạc)

**Files:**
- Create: `.gitignore`, `scripts/fetch-raw.sh`, `scripts/build-assets.sh`, `scripts/check-assets.sh`
- Output: `assets/photos/{name}.webp`, `assets/photos/thumb/{name}.webp`, `assets/video/highlight.mp4`, `assets/video/poster.webp`, `assets/qr/duc.webp`, `assets/qr/linh.webp`, `assets/og.jpg`, `assets/music.mp3`

**Interfaces:**
- Produces: các đường dẫn trên; `assets/photos/manifest.txt` — mỗi dòng một tên ảnh (không đuôi) theo thứ tự album đã chọn, dòng đầu là ảnh hero.

- [ ] **Step 1: Viết `scripts/check-assets.sh`** — exit ≠ 0 nếu: thiếu file nào ở trên; số `.webp` trong `assets/photos/` ≠ 20 hoặc trong `thumb/` ≠ 20; mỗi ảnh full > 500 KB hoặc thumb > 120 KB; `highlight.mp4` > 25 MB hoặc duration (ffprobe) ngoài 75–105 s hoặc chiều cao ≠ 720; `og.jpg` không phải 1200×630; `manifest.txt` ≠ 20 dòng.
- [ ] **Step 2: Chạy** `bash scripts/check-assets.sh` → FAIL (chưa có gì).
- [ ] **Step 3: `.gitignore`** chứa `raw/`. **`scripts/fetch-raw.sh`**: tải 20 ảnh vào `raw/photos/` và video vào `raw/video/LINH-DUC.mp4` (curl link usercontent ở trên); bỏ qua file đã có; kiểm số ảnh = 20.
- [ ] **Step 4: Chọn ảnh và đoạn video** (việc của Claude, user đã giao):
  - Ảnh: `ffmpeg` dựng contact sheet 20 ảnh, xem bằng Read, chọn hero (ảnh dọc/ngang đẹp nhất hai người) và thứ tự album → ghi `assets/photos/manifest.txt`.
  - Video: trích 1 frame / 20 s thành contact sheet, xem, chọn 8–10 đoạn ~9–10 s đẹp (tránh đen, chữ, credit). Ghi danh sách `start duration` vào đầu `scripts/build-assets.sh` dạng mảng `SEGMENTS`.
- [ ] **Step 5: `scripts/build-assets.sh`** (idempotent):
  - Ảnh → `libwebp` q80, cạnh dài 1600 (full) và 600 (thumb), xoá EXIF.
  - Video → cắt `SEGMENTS`, nối, `scale=-2:720`, `libx264 -crf 28 -preset slow`, `aac 128k`, crossfade audio ngắn nếu dễ (không bắt buộc), `-movflags +faststart`; poster = frame đầu đoạn 1 → webp.
  - QR crop (vùng mã + viền trắng ~4%): duc `crop=818:818:192:528`, linh `crop=508:515:333:749` — xem lại bằng Read và chỉnh toạ độ nếu lệch; scale 600px; webp **lossless** (QR phải quét được).
  - `og.jpg`: ảnh hero crop 1200×630, q82.
- [ ] **Step 6: Nhạc** — tải một bản piano/acoustic lãng mạn miễn phí bản quyền (Pixabay Music hoặc nguồn CC0), ≤ 4 MB, lưu `assets/music.mp3`; ghi tên bài + URL + giấy phép vào `README.md` mục "Nhạc". Nếu không tải tự động được: dừng, báo user cung cấp mp3.
- [ ] **Step 7: Chạy** `bash scripts/fetch-raw.sh && bash scripts/build-assets.sh && bash scripts/check-assets.sh` → PASS. Quét thử QR crop bằng `zbarimg` nếu có (hoặc mở trên điện thoại): ra chuỗi VietQR chứa đúng STK.

### Task 2: Trang tĩnh `index.html` + `styles.css`

**Files:**
- Create: `index.html`, `styles.css`, `scripts/check-page.sh`

**Interfaces:**
- Consumes: đường dẫn `assets/*` và `manifest.txt` từ Task 1 (thứ tự `<img>` trong album theo manifest).
- Produces cho Task 3 (hook DOM, đặt đúng tên):
  - `#envelope` (button phủ toàn màn, `aria-label="Mở thiệp"`), `.envelope__flap`, `.envelope__seal`
  - `#hero`, `.hero__bg` (img hero), `.hero__names`
  - `#events`, `.timeline__line` (SVG path), `.event-card` ×3
  - `#gallery`, `.gallery__track`, `.gallery__item` (button chứa `<img>` thumb, `data-full="assets/photos/<name>.webp"`), `dialog#lightbox` với `img`, nút `.lightbox__prev/.lightbox__next/.lightbox__close`
  - `video#highlight` (`preload="none"`, `poster`, `controls`, `playsinline`)
  - `.gift-card` ×2, mỗi thẻ có `button.copy-btn[data-copy="<STK chữ số>"]`; `#toast` (`role="status"`)
  - `audio#bgm` (`loop`, `preload="none"`, src `assets/music.mp3`), `button#music-toggle` (`aria-pressed`)
  - `<html class="no-js">` — Task 3 đổi thành `js`

- [ ] **Step 1: Viết `scripts/check-page.sh`** — grep `index.html`, exit ≠ 0 nếu thiếu bất kỳ chuỗi: `Trọng Đức & Nhật Linh`, `2026-11-28T16:00+07:00`, `2026-12-04T17:45+07:00`, `2026-12-12T10:00+07:00`, `98 Thái Thịnh`, `xã Thiên Nhẫn`, `227476796`, `9972388394`, `NGUYEN TRONG DUC`, `DOAN NHAT LINH`, `og:image`, `gsap@3.15.1`; và nếu có chuỗi `Nhật Linh & Trọng Đức`, `countdown`, `calendar`. Đếm đúng 20 `gallery__item`, 3 `event-card`.
- [ ] **Step 2: Chạy** → FAIL.
- [ ] **Step 3: Viết `index.html`** theo thứ tự spec: phong bì → hero → 3 buổi (dùng bảng Global Constraints, thẻ `<time datetime>`, nút "Chỉ đường" `target="_blank" rel="noopener"`) → album → video → mừng cưới (QR, ngân hàng, tên TK, STK, nút "Sao chép STK") → lời cảm ơn ngắn thân mật → nút nhạc nổi. `<head>`: `lang="vi"`, viewport, title "Trọng Đức & Nhật Linh – Thiệp mời cưới", OG (`og:title` như title, `og:description` một câu mời thân mật, `og:image` = `https://wedding.voccer.net/assets/og.jpg`, `og:type=website`), preload ảnh hero, Google Fonts, 3 script GSAP `defer` + `main.js` `defer`. Thẻ Hải Xồm thêm một dòng vui kiểu "Không say không về 🍻". Mọi `<img>` có `alt`, `width`, `height`.
- [ ] **Step 4: Viết `styles.css`** — tokens màu/font ở `:root`; mobile-first; `.no-js #envelope { display:none }`; dải album: lưới trên mobile, flex ngang (cho Task 3 pin) từ `min-width:768px`; nút ≥ 44px; `:focus-visible` rõ; `@media (prefers-reduced-motion: reduce)` tắt transition/animation CSS; `body` có `overflow-x: clip`.
- [ ] **Step 5: Chạy** `bash scripts/check-page.sh` → PASS. Mở `python3 -m http.server 8000` + Chrome, tắt JS: đọc được toàn bộ nội dung ở 375px và 1440px, không scroll ngang.

### Task 3: Hiệu ứng & tương tác `main.js`

**Files:**
- Create: `main.js`

**Interfaces:**
- Consumes: hook DOM từ Task 2.

- [ ] **Step 1: Khởi tạo** — đổi `no-js`→`js`; `gsap.registerPlugin(ScrollTrigger, SplitText)`; nếu `window.gsap` không có thì chỉ gắn tương tác cơ bản (phong bì ẩn ngay, copy, lightbox, nhạc) và return. `gsap.matchMedia()` với nhánh `(prefers-reduced-motion: no-preference)` chứa toàn bộ animation; nhánh reduce không animate.
- [ ] **Step 2: Phong bì** — khoá scroll khi phong bì hiện. Click/Enter: gọi `bgm.play()` **đồng bộ trong handler**, set volume 0→0.6 bằng tween; timeline: nắp `rotateX` lật (perspective), thiệp trượt lên, phong bì fade, mở scroll, chạy intro hero. `play()` reject → `music-toggle` `aria-pressed=false`.
- [ ] **Step 3: Hero** — Ken Burns (`scale 1.15→1`, ~12 s); `.hero__names` SplitText `chars` stagger (preset motion.csv "Stagger List"); canvas cánh hoa ~30 hạt, `requestAnimationFrame`, dừng khi tab ẩn và khi hero ra khỏi viewport; không chạy ở nhánh reduce.
- [ ] **Step 4: 3 buổi** — `.timeline__line` vẽ bằng `strokeDashoffset` scrub theo `#events`; mỗi `.event-card` reveal (y 24→0, opacity) khi vào viewport.
- [ ] **Step 5: Album** — ≥ 768px: pin `#gallery`, `.gallery__track` dịch `x` theo scroll (scrub, `invalidateOnRefresh`); < 768px: mỗi item reveal `clip-path inset(100% 0 0 0)→inset(0)`. Lightbox: `showModal()`, prev/next, phím ←/→/Esc, vuốt ngang (pointer events, ngưỡng 50px), nạp `data-full`.
- [ ] **Step 6: Video & nhạc** — `highlight` `play` → pause bgm (nhớ trạng thái); `pause/ended` → resume nếu trước đó đang phát. `#music-toggle` bật/tắt + đĩa xoay (CSS class `is-playing`). `visibilitychange` ẩn tab → pause, hiện lại → resume nếu trước đó phát.
- [ ] **Step 7: Mừng cưới** — `.copy-btn`: `navigator.clipboard.writeText` → fallback textarea + `execCommand('copy')`; toast "Đã sao chép STK" 2 s. `.gift-card` tilt theo pointer (rotateX/Y ≤ 8°, reset khi rời), chỉ nhánh no-preference.
- [ ] **Step 8: Kiểm tra trong Chrome** (`python3 -m http.server 8000`, viewport 375×812 và 1440×900): console không lỗi; mở phong bì → nhạc phát; cuộn hết trang mượt; lightbox đủ thao tác; phát video → nhạc dừng, dừng video → nhạc chạy lại; copy cả 2 STK đúng chữ số; bật emulate `prefers-reduced-motion: reduce` → nội dung hiện đủ, không animation; chặn request jsdelivr → trang vẫn dùng được. Ghi GIF luồng chính.

### Task 4: Deploy & hướng dẫn

**Files:**
- Create: `README.md`

- [ ] **Step 1: `README.md` (tiếng Việt)** — cấu trúc thư mục; cách tái tạo assets (`fetch-raw.sh`, `build-assets.sh`, `check-assets.sh`); mục "Nhạc" (nguồn + giấy phép); deploy: Vercel → Add New Project → import `voccer/marries`, Framework Preset "Other", không build command, output là thư mục gốc; domain: Vercel Project → Settings → Domains thêm `wedding.voccer.net` → Cloudflare DNS thêm `CNAME wedding` → giá trị Vercel hiển thị, **Proxy status: DNS only**; sau khi push, Vercel tự deploy.
- [ ] **Step 2: Kiểm tra cuối** — `bash scripts/check-assets.sh && bash scripts/check-page.sh` PASS; `git status` không có gì trong `raw/`; `du -sh assets` < 40 MB; dùng tool test Open Graph (hoặc đọc `<head>`) xác nhận `og:image` URL tuyệt đối đúng domain. Liệt kê file đã đổi cho user (không commit).
