# Phase 01: Backend Implementation

## Mục tiêu:
Tạo method `OpenApkFolder` trong Go để mở thư mục APK tương ứng với Build Variant hiện tại.

## Các đầu việc:
- [ ] Cập nhật `app.go`: Thêm method `OpenApkFolder(projectPath string, variant string)`.
- [ ] Logic xác định đường dẫn: `{projectPath}/app/build/outputs/apk/{variant}/`.
- [ ] Thực thi lệnh hệ thống đa nền tảng:
    - Windows: `explorer [path]`
    - Linux: `xdg-open [path]`
    - macOS: `open [path]`

## Files to Modify:
- `app.go`

## Test Criteria:
- Go code biên dịch thành công.
