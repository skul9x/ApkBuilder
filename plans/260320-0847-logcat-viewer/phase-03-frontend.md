# Phase 03: Frontend Component
Status: ✅ Completed

## Objective
Xây dựng giao diện mô phỏng Android Studio Logcat v2 siêu mượt. Giao diện có Header Control (Toolbar), Thanh Search xịn và một Virtualized List chứa hàng vạn dòng.

## Functional Requirements
- [ ] Header UI: Dropdown Device Selection, Play/Pause toggle, Clear Trash button.
- [ ] Filter Area: Filter Tag/Message Text. Dropdown Log Level (Verbose, Debug, Info, Warn, Error).
- [ ] Bảng điều khiển log: Danh sách hiển thị cuộn không giật (Windowing). Màu Level rõ ràng (Đỏ/Lỗi, Xanh lá/Info...).

## Implementation Steps
1. [ ] Khởi tạo thư mục Component `LogcatViewer` ở thư mục frontend.
2. [ ] Dùng thư viện Virtual Scroll (như `react-window` hoặc vue-virtual-scroller tùy project config) để list 50k nodes không sập chorme V8.
3. [ ] Regex Search realtime trên Frontend filter các thuộc tính theo chuỗi User gõ (vd: `tag:Activity message:Click`).

## Test Criteria
- [ ] UI load 10.000 phần tử mảng sample giả lập vẫn đạt 60 FPS khi cuộn chuột.
- [ ] Lọc Type=Error ngay lập tức rút gọn bảng chỉ còn dòng lỗi màu Đỏ.
