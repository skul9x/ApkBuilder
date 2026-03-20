# Phase 01: Setup & ADB Engine
Status: ✅ Completed

## Objective
Khởi tạo cấu trúc Backend Go cơ bản để giao tiếp với `adb` (Android Debug Bridge), lấy danh sách thiết bị và thiết lập kết nối streaming.

## Functional Requirements
- [ ] Connect tới adb CLI locale.
- [ ] Hàm `GetConnectedDevices()` lấy danh sách devices đang cắm.
- [ ] Hàm `StartLogcat(deviceID)` dùng `os/exec` mở tiến trình `adb logcat` và hứng Stdout bằng `bufio.Scanner`.

## Implementation Steps
1. [ ] Tạo package mới `pkg/adb/` hoặc thư mục logic tương đương cho Backend.
2. [ ] Viết Struct `AdbManager`.
3. [ ] Parse trả về JSON models có cấu trúc (ví dụ list string device id).
4. [ ] Khai báo Wails bound method gọi vào `AdbManager`.

## Test Criteria
- [ ] App nhận diện đúng 1 hoặc nhiều thiết bị ảo/thật qua lệnh backend.
