# Changelog

## [2026-03-20]
### Added
- **Logcat Viewer Integration:** Hệ thống xem log Android thời gian thực tích hợp trực tiếp vào App. 
- **Auto-Scroll Mechanism:** Tính năng tự động cuộn xuống khi có log mới; tự động ngắt cuộn khi người dùng chủ động vuốt ngược lên để xem log cũ (User-controlled override).
- **Export Logcat:** Hỗ trợ xuất toàn bộ nội dung log ra file `.txt` thông qua Wails Save Dialog.
- **UI Virtualization:** Tích hợp `react-window` hỗ trợ hiển thị danh sách log cực lớn lên đến 50,000 dòng mà không gây giật lag (O(1) rendering).

### Fixed
- **Logcat Overlapping UI:** Khắc phục lỗi các dòng log chồng chéo lên nhau do ngắt dòng tự động. Chuyển sang chế độ hiển thị 1 dòng (ellipsis) kèm Tooltip xem chi tiết khi Hover.
- **Combobox Legibility:** Sửa lỗi chữ khó nhìn trong ô chọn thiết bị và Level bằng cách ép màu chữ Đen trên nền Trắng để đạt độ tương phản tối đa.

### Changed
- **Thư viện react-window:** Hạ cấp về bản v1 để tương thích hoàn toàn với cơ chế ESM của Vite/Wails, tránh lỗi module resolution khi Build.

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
