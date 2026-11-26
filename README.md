# Thiệp cưới Trọng Đức & Nhật Linh

Website tĩnh một trang, gửi qua Zalo hoặc Messenger để mời người thân và bạn bè đến chung vui.

## Cấu trúc

- `index.html`, `styles.css`, `main.js`: nội dung, giao diện và tương tác.
- `assets/photos/manifest.txt`: thứ tự 20 ảnh; dòng đầu là ảnh bìa.
- `assets/`: ảnh WebP, video rút gọn, QR, ảnh chia sẻ và nhạc đã nén.
- `raw/`: ảnh, video và nhạc gốc; thư mục này không đưa lên Git.
- `qr/`: ảnh QR gốc.
- `scripts/`: tải nguồn, dựng tài nguyên và kiểm tra.

## Tạo lại tài nguyên

Cần `bash`, `curl`, `ffmpeg` có `libwebp` và `libx264`. Chạy từ thư mục dự án:

```bash
bash scripts/fetch-raw.sh
bash scripts/build-assets.sh
bash scripts/check-assets.sh
bash scripts/check-page.sh
```

`build-assets.sh` đọc danh sách ảnh trong manifest, tạo ảnh full và thumbnail, nối 9 đoạn video thành highlight khoảng 90 giây, crop QR và nén nhạc. Có thể chạy lại khi cần; file đầu ra được ghi đè.

## Nhạc

“Beautiful In White” – Shayne Ward (file do cô dâu chú rể cung cấp, `raw/music/beautiful-in-white.mp3`). Bản trên trang được cắt 1,5s–150s, có fade in/out (xem `scripts/build-assets.sh`). Bài hát có bản quyền: dùng cho thiệp cá nhân theo quyết định của chủ trang.

## Chạy và đưa lên Vercel

Xem thử tại máy bằng `python3 -m http.server 8000` rồi mở `http://localhost:8000`.

Trên Vercel, chọn **Add New Project** → import `voccer/marries`. Chọn **Framework Preset: Other**, để trống build command và dùng thư mục gốc làm output. Trong **Project → Settings → Domains**, thêm `wedding.voccer.net`. Trên Cloudflare DNS, thêm bản ghi **CNAME** tên `wedding`, giá trị theo Vercel hiển thị, **Proxy status: DNS only**. Sau khi bạn push lên GitHub, Vercel sẽ tự triển khai.
