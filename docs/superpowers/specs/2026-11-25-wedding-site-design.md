# Thiệp cưới online Trọng Đức & Nhật Linh — Thiết kế

## Mục đích

Một link duy nhất gửi cho mọi khách (Zalo/Messenger) để mời dự 3 buổi tiệc, kèm ảnh cưới,
video, nhạc nền và QR mừng cưới. Hạn chót: link phải chạy trước **28/11/2026** (buổi đầu).

- **Mục tiêu:** khách mở trên điện thoại thấy ngay ai cưới, buổi nào, ở đâu, bấm được chỉ đường;
  trải nghiệm "xịn" với hiệu ứng hiện đại.
- **Không làm:** xác nhận tham dự (RSVP), link riêng theo nhóm khách, tên phụ huynh, đếm ngược,
  thêm vào lịch, làm mờ buổi đã qua, câu chuyện tình yêu, sổ lưu bút, backend.
- **Thất bại nếu:** trang chậm/giật trên 4G, hiệu ứng che mất thông tin, sai ngày giờ/địa điểm/STK.

## Nội dung

| Buổi | Ngày giờ | Địa điểm |
|---|---|---|
| Tiệc báo hỷ nhà gái | 16:00 thứ Bảy 28/11/2026 | Yên Bái |
| Tiệc thân mật bạn bè | 17:45 thứ Sáu 04/12/2026 | Quán bia Hải Xồm, 98 Thái Thịnh, Hà Nội |
| Lễ thành hôn | 11:00 thứ Bảy 12/12/2026 | Tư gia nhà trai, xóm 9, xã Thiên Nhẫn, tỉnh Nghệ An |

Hiển thị theo thứ tự thời gian như bảng trên.

- Cô dâu: **Đoàn Nhật Linh** — Vietcombank `9972388394` DOAN NHAT LINH (`qr/IMG_1795620037683_1795620099653.jpg`)
- Chú rể: **Nguyễn Trọng Đức** — VPBank `227476796` NGUYEN TRONG DUC (`qr/Title_1795620036369.jpg`)
- Ảnh: 20 file `BTT_*.jpg` (~6,7 MB/ảnh), Drive folder `1J2rKrqPj2rfhhUtyKOVkxuvpxP0JAWsi`
- Video: `LINH-DUC.mp4` 18:40, 1080p, 468 MB, Drive file `1orYJlTj8Mo4w33qbS76eUD1iWo2PPZSN`

## Cách làm (đã chọn)

| Hướng | Đánh đổi | Kết quả |
|---|---|---|
| **A. HTML/CSS/JS tĩnh, 1 trang** | Không build, nhanh nhất; tự nén ảnh bằng script | **Chọn** |
| B. Astro | Tối ưu ảnh sẵn nhưng thêm npm + build cho 1 trang | Loại |
| C. Next.js | Quá nặng cho thiệp tĩnh | Loại |

## Thiết kế đã chốt

- **Thứ tự tên:** "Trọng Đức & Nhật Linh" ở mọi chỗ.
- **Giọng văn:** thân mật, gần gũi (cả họ hàng lẫn bạn bè).
- **Link preview (Open Graph):** ảnh hero + tiêu đề "Trọng Đức & Nhật Linh – Thiệp mời cưới".

- **Màu:** nền ngà `#FBF7F0`, chữ rượu vang `#6B1F2A`, nhũ vàng champagne `#B8925A`.
- **Font (Google Fonts, đã kiểm có subset vietnamese):** Great Vibes (tên), Cormorant Infant (tiêu đề),
  Be Vietnam Pro (nội dung, số).
- **Hiệu ứng:** GSAP + ScrollTrigger + SplitText từ CDN, pin version cụ thể.

Thứ tự phần trên trang:

1. **Phong bì mở đầu** — phong bì 3D, dấu sáp "Đ & L", chạm để mở → nắp lật, thiệp trượt ra,
   nhạc fade-in (cử chỉ chạm này cũng mở khoá autoplay của trình duyệt).
2. **Hero** — ảnh lớn Ken Burns, tên hiện từng chữ (SplitText), cánh hoa rơi nhẹ (~30 hạt).
3. **3 buổi tiệc** — đường chỉ vàng tự vẽ khi cuộn (scrub), thẻ hiện dần; mỗi thẻ có nút
   nút **Chỉ đường** (link Google Maps search). Buổi đã qua vẫn hiển thị như thường.
4. **Album 20 ảnh** — desktop: dải ngang được pin khi cuộn; mobile: lưới reveal kiểu mở màn;
   bấm xem to bằng `<dialog>` native, vuốt/phím mũi tên chuyển ảnh.
5. **Video** — bản rút gọn ~90s, có poster; phát video thì tạm dừng nhạc nền.
6. **Mừng cưới** — 2 thẻ QR (đã crop phần mã), tên + STK + nút sao chép với toast; nghiêng 3D
   theo con trỏ/chạm.
7. **Lời cảm ơn** — kết trang.
8. **Nút nhạc nổi** — đĩa than xoay khi phát, bấm bật/tắt.

Bắt buộc: `prefers-reduced-motion` tắt hiệu ứng nhưng nội dung vẫn hiện đủ; nút ≥ 44px; ảnh
có `alt`; không scroll ngang trên 375px.

## Tài nguyên & build

- File gốc (ảnh, video) để trong `raw/`, **gitignore** — GitHub chặn file > 100 MB.
- `scripts/build-assets.sh` (ffmpeg, máy đã có): ảnh → WebP cạnh dài 1600px + thumb 600px;
  video → highlight ~90s 720p, `+faststart`, < 25 MB, kèm poster; crop QR.
- Output vào `assets/` và được commit.

## Deploy

- Repo GitHub ← user tạo; Vercel import repo (Git integration tự deploy mỗi lần push, không cần
  GitHub Actions). Không cần `vercel.json`.
- Domain `wedding.voccer.net` (DNS trên Cloudflare): user thêm CNAME `wedding` → giá trị Vercel
  hiển thị, chế độ **DNS only** (tắt proxy cam). Viết hướng dẫn trong `README.md`.
- Repo: chính repo `marries` này (user tự push).

## Quyết định của Claude (user có thể sửa)

- Nhạc: bản piano lãng mạn miễn phí bản quyền từ Pixabay Music; user có thể thay mp3 khác.
- Video highlight: Claude tự chọn đoạn đẹp trong 18:40 (user giao).
- Ảnh hero và thứ tự album: Claude chọn (user giao).

## Để lại cho builder

Lời văn chi tiết, kích thước/khung hình chi tiết, thông số nén cụ thể, toạ độ crop QR.
