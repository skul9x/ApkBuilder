# Phase 02: Backend Log Parser
Status: ⬜ Pending

## Objective
Biến chuỗi stdout text hỗn độn từ Logcat thành cấu trúc dữ liệu JSON nhẹ qua Regex Parser, sau đó truyền (emit) đi liên tục (streaming).

## Functional Requirements
- [ ] Regex hoặc String Split engine để tách: `Date/Time`, `PID`, `TID`, `Level`, `Tag`, `Message`.
- [ ] Chuyển đổi thành Json `LogEntry` struct.
- [ ] Emit luồng data lên giao diện qua thư viện Wails Events.

## Implementation Steps
1. [ ] Viết hàm `parseLogLine(line string) *LogEntry` chuẩn 100% định dạng default của Logcat (`adb logcat -v threadtime`).
2. [ ] Tích hợp vào vòng lặp `Scanner` ở Phase 01, hễ có dòng mới là truyền Emit ngay lập tức bằng `runtime.EventsEmit`.
3. [ ] Xử lý ngắt luồng (Kill Process) khi User chọn chức năng Stop hoặc chuyển thiết bị.

## Test Criteria
- [ ] `parseLogLine` pass Unit Test với 5 dòng mẫu (Information, Warning, Error stack trace).
- [ ] Memory không bị leak khi bắn 10,000 dòng liên tục từ backend lên.
