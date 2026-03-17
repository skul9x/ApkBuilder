# Phase 02: Go Backend Localization

## Mục tiêu:
Việt hóa toàn bộ thông báo trả về từ Go Code cho Frontend và các nhãn Log do Backend đẩy lên (Info/Success/Error).

## Các đầu việc:
- [ ] Chỉnh sửa `app.go`: Việt hóa "Project Loaded", "Folder select error", "No Apk found"...
- [ ] Chỉnh sửa `internal/builder/executor.go`: Việt hóa các log tự định nghĩa (Bắt đầu build, chạy clean...).
- [ ] Giữ nguyên các dòng log thô từ Gradle/ADB (Raw Logs).
- [ ] Test kết nối: Đảm bảo Wails vẫn nhận và đẩy log lên console Frontend mượt mà.

## Các file sẽ chỉnh sửa:
- `app.go`
- `internal/builder/executor.go`
- `internal/builder/version.go` (nếu có thông báo)

## Kiểm thử:
- [ ] Chạy `wails dev` và kiểm tra các log hệ thống là tiếng Việt.
