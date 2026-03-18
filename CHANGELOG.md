# Changelog

## [2026-03-18]
### Fixed
- **ADB Path Error:** Sửa lỗi "executable file not found in $PATH" bằng cách thêm logic quét tự động các đường dẫn Android SDK/platform-tools mặc định trên Linux và Windows.
- **Tự động nhận diện môi trường:** Cập nhật công cụ hỗ trợ tìm kiếm Android SDK và Java Home (JDK/JRE) một cách thông minh, giúp app hoạt động ngay lập tức mà không cần thiết lập biến môi trường thủ công.
- **Hệ thống Device Count:** Sửa lỗi không nhận diện thiết bị điện thoại do sai đường dẫn ADB.


## [2026-03-17]
### Added
- **UI/UX Redesign:** Giao diện phong cách Apple Minimalist với tông màu Dark Blue sang trọng.
- **Tính năng Mở Thư Mục:** Nút "Mở thư mục" truy cập nhanh file APK vừa build (Windows, Linux, macOS).
- **Hệ thống UX:** Phím tắt (Ctrl+B, Esc), Toast thông báo, và hiệu ứng Glassmorphism.
- **Kiểm thử:** Unit test cho logic tự động tăng phiên bản APK.
- Dự án được viết lại hoàn toàn từ Python sang Go/Wails.
- Giao diện Premium Dark Mode với React & Tailwind CSS.
- Tính năng Deep Clean (xóa sạch cache build).
- Tính năng Stop Gradle Daemon.
- Hỗ trợ cài đặt APK trực tiếp qua ADB.
- Hệ thống streaming log thời gian thực.
- Việt hóa toàn bộ giao diện (100% Tiếng Việt).
- **Thương hiệu & Bản quyền:** Đổi tên App thành "Apk Builder", thêm Footer bản quyền của Nguyễn Duy Trường và hiển thị phiên bản Go.
- **Tinh chỉnh UI/UX:** Sửa padding nút Build, cân đối thanh công cụ, và mở rộng cửa sổ ứng dụng (1200x800).
- **Phản hồi hệ thống:** Thêm Tooltip hướng dẫn và chuẩn hóa font chữ Inter.
- **Backend:** Thêm binding `GetGoVersion` để hiển thị thông tin engine.

### Fixed
- Sửa lỗi Tailwind CSS không hoạt động trong môi trường Wails + Vite.
- Sửa lỗi import Go module name.
