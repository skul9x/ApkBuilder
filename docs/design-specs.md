# Design Specifications: Logcat Viewer

## 🎨 Color Palette (Dark Theme / Glassmorphism)

| Name | Hex Code | Usage | Giải thích |
|------|-----------|-------|------------|
| Background | `#0f172a` | Nền chính | Màu mảng tối (Xám xanh) không gây mỏi mắt như đen tuyền. |
| Surface | `#1e293b` | Toolbar, Search | Khối nổi mờ mờ trên nền. Kết hợp `backdrop-blur` CSS tạo hiệu ứng kính Glassmorphism. |
| Text Primary | `#f87171` | Dòng log Error | Màu đỏ dịu cho lỗi (Error), giúp anh không bị chói mắt. |
| Text Warning | `#fbbf24` | Dòng log Warn | Màu vàng cảnh báo. |
| Text Info | `#34d399` | Dòng log Info | Màu xanh lá mint êm ái. |
| Text Debug | `#60a5fa` | Dòng log Debug | Màu xanh dương. |
| Text Normal | `#f1f5f9` | Dòng Text/Verbose | Màu trắng xám cho văn bản thông thường. |
| Accent/Border | `#334155` | Viền (Border) | Dùng chia cách các hàng trong bảng List. |

## 📝 Typography

- **Font chữ chính:** `Inter` (Font không chân siêu dễ đọc, chuẩn cho UI Data chuyên nghiệp).
- **Size Text:** Base là `13px` cho bảng log, tiết kiệm diện tích để nhét được nhiều dữ liệu. Header/Toolbar là `14px`.
- **Line Height:** `1.5` để cách dòng rộng rãi, không bị díu chữ.

## 📐 Layout & Spacing (Khoảng cách)

- **Layout tổng:** Gồm 2 ngăn ngang (Row). 
  - Ngăn 1 (Height: 48px): Device Selector và các nút Play, Pause, Clear.
  - Ngăn 2 (Height: 48px): Search Bar.
  - Ngăn 3 (Full còn lại): Virtual Log Table.
- **Table Columns Width:**
  - `Time`: ~100px
  - `Level`: ~60px
  - `Tag`: ~150px
  - `Package`: ~200px
  - `Message`: Phần còn lại (Flex-grow).

## ✨ Micro-Interactions (Hiệu ứng UX)

- Hiệu ứng Cuộn (Scrolling): Dùng thanh cuộn dẹt, bo tròn, tự ẩn đi khi không tương tác (như Mac OS).
- Hover Row: Khi rê chuột vào từng dòng Log, nền dòng đó tự sáng nhẹ đổi sang `#1e293b`.
- Animations: Các nút bấm sẽ mờ 20% khi được bấm để tạo cảm giác phản hồi click.
