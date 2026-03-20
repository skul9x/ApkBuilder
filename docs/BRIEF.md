# 💡 BRIEF: Logcat Viewer cho ApkBuilder

**Ngày tạo:** 2026-03-20

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
Developer cần công cụ chuyên nghiệp để xem Android log của thiết bị trực tiếp từ ứng dụng ApkBuilder, mà không cần phải mở Android Studio nặng nề hoặc sử dụng Terminal terminal khô khan.

## 2. GIẢI PHÁP ĐỀ XUẤT
Tích hợp module Logcat Viewer (mang UI/UX hiện đại của Android Studio Logcat v2) thẳng vào ApkBuilder. Module hỗ trợ hiển thị real-time, bộ máy lọc tìm kiếm thông minh, và quản lý thiết bị ADB.

## 3. ĐỐI TƯỢNG SỬ DỤNG
- **Primary:** Developer, QA Tester sử dụng ApkBuilder thông qua giao diện Wails.

## 4. NGHIÊN CỨU THỊ TRƯỜNG & KHÁC BIỆT
### Hạn chế của công cụ hiện tại:
- Android Studio: Quá nặng, consume rất nhiều RAM, thời gian khởi động lâu.
- Terminal `adb logcat`: Khó filter đa chiều, không có màu sắc theo ngữ cảnh, không thân thiện với thao tác chuột.

### Điểm khác biệt của ApkBuilder Logcat:
- Giao tiếp mượt mà, "nhẹ như lông hồng" với kiến trúc luồng Go và giao diện Web (Wails v2).
- Thẩm mỹ cao, gọn gàng, mang cảm giác Premium UI.

## 5. TÍNH NĂNG CHÍNH

### 🚀 MVP (Bắt buộc có):
- [x] Hiển thị log real-time qua stream ADB.
- [x] Chọn thiết bị & Quản lý thiết bị đang kết nối.
- [x] Lọc đơn giản theo Log Level (V, D, I, W, E, A).
- [x] Nút điều khiển: Pause/Resume log stream, Clear logs, Copy logs.
- [x] Dùng Virtual Scrolling/Windowing ở Frontend để đảm bảo 1 vạn dòng không lag chết UI.

### 🎁 Phase 2 (Cải tiến sau MVP):
- [ ] Tìm kiếm nâng cao kiểu truy vấn v2: `tag:MainActivity & message:Error`.
- [ ] Lọc theo Package ID (tách lập list Process map trên thiết bị).
- [ ] Export Logs ra `.txt` bằng Save File Dialog.
- [ ] Mở code IDE nếu bấm vào link.

## 6. ƯỚC TÍNH SƠ BỘ
- **Độ phức tạp:** Khó (Về kiến trúc & xử lý streaming Data).
- **Rủi ro:** 
  - Engine Parsing cho Go backend nếu không viết tối ưu sẽ ngốn memory khi parse chuỗi rác. 
  - Frontend DOM leak cần phòng ngừa qua logic xoay vòng Array data.

## 7. BƯỚC TIẾP THEO
→ Chuyển qua Spec & Plan chi tiết để làm bản thiết kế kỹ thuật.
