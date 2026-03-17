# Phase 04: Friendly Error Messaging

## Mục tiêu:
Dịch và thân thiện hóa các thông báo lỗi kỹ thuật sang Tiếng Việt dễ hiểu cho người dùng.

## Các đầu việc:
- [ ] Dịch parser thông minh (`logparser.go`): Kiểm tra các lỗi thông thường.
- [ ] Dịch thông báo "Không tìm thấy APK": Gợi ý kiểm tra biến Build.
- [ ] Dịch thông báo "ADB install failed": Gợi ý kiểm tra kết nối thiết bị.
- [ ] Thân thiện hóa các câu thông báo: "Build thành công! Đã tăng version lên V1.0.1".

## Các file sẽ chỉnh sửa:
- `internal/builder/logparser.go`
- `app.go`
- `internal/builder/executor.go`

## Kiểm thử:
- [ ] Xảy ra lỗi và UI thông báo bằng Tiếng Việt thân thiện.
