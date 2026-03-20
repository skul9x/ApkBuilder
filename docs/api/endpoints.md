# API Documentation - Apk Builder

Ngày cập nhật: 2026-03-17
Engine: Wails v2 (Go Backend)

---

## 🛠️ App Management

### SelectFolder
Mở hộp thoại chọn thư mục dự án Android.
- **Returns:** `string` (Đường dẫn thư mục)

### LoadProject
Tải thông tin dự án từ đường dẫn đã chọn.
- **Params:** `path: string`
- **Returns:** `map[string]string` (`{path, apk_name, error}`)

### SaveApkName
Lưu tên file APK mong muốn vào cài đặt dự án.
- **Params:** `path: string, name: string`

### GetGoVersion
Lấy phiên bản Golang hiện tại của hệ thống.
- **Returns:** `string` (e.g., `go1.22.2`)

---

## 🚀 Build Logic

### RunGradle
Thực thi lệnh Gradle (clean, assemble, etc.)
- **Params:** `projectPath: string, command: string`
- **Returns:** `string` ("Đầm bắt đầu")

### DeepClean
Xóa sạch build artifacts và cache `.gradle`.
- **Params:** `projectPath: string`

### StopGradle
Dừng toàn bộ Gradle Daemons đang chạy.

---

## 📲 Device & Install

### InstallApk
Cài đặt APK vừa build vào thiết bị qua ADB.
- **Params:** `projectPath: string, variant: string`
- **Returns:** `string` (Trạng thái cài đặt)

### GetDeviceCount
Đếm số lượng thiết bị Android đang kết nối.
- **Returns:** `int`

---

## 📂 Navigation

### OpenApkFolder
Mở thư mục chứa file APK trong trình quản lý file.
- **Params:** `projectPath: string, variant: string`
- **Returns:** `string` (Trạng thái mở)
