# Phase 04: Integration & Test
Status: ✅ Complete

## Objective
Ghép toàn mạch Backend - Frontend. Bật Event Hooking, bảo trì vòng đời RAM/Performance, Export Log.

## Functional Requirements
- [x] Frontend lắng nghe `EventsOn("onNativeLog")` và lưu dữ liệu vào local React/Vue State (bảng array).
- [x] Tự động thanh lọc Array nếu Push vào > 50,000 dòng để tránh Browser crash (cắt đuôi mảng đầu).
- [x] Cài chức năng "Cuộn Tự Động" (Auto Scroll to Bottom) như Terminal xịn. Ngắt Auto Scroll khi User đang chủ động vuốt lên giữ vị trí. 

## Implementation Steps
1. [x] Gọi API Load Devices của Wails Backend vào Dropdown.
2. [x] Ràng buộc logic Select Device -> Gọi Go Start Logcat `Device_ID`.
3. [x] Thêm nút Export Log gọi API Go Save Dialog lấy kết xuất file TXT thuần. 

## Test Criteria
- [x] Chuyển tab thiết bị, danh sách cũ được dọn sạch, gọi lại stream ADB device mới mà Go Runtime không bị Crash (Leak routine).
