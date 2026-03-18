# Apk Builder 🚀

**Apk Builder** là một công cụ mạnh mẽ và tối giản dành cho các nhà phát triển Android, giúp tự động hóa quy trình build, cài đặt và quản lý file APK. Ứng dụng được xây dựng trên nền tảng **Go (Wails v2)** cho hiệu suất cao và **React/Tailwind CSS** cho giao diện hiện đại phong cách Apple.

## 🌟 Tính năng chính

- 📂 **Lựa chọn dự án thông minh:** Dễ dàng chọn thư mục dự án Android và tự động nhận diện cấu hình.
- ⚙️ **Tự động nhận diện môi trường:** Tự động quét và tìm kiếm Android SDK (ADB) và Java Home trên cả Linux và Windows ở các vị trí mặc định phổ biến.
- 🛠️ **Build Gradle linh hoạt:** Hỗ trợ Clean, Assemble Debug và Assemble Release chỉ với một cú click.
- 📲 **Cài đặt ADB:** Tự động phát hiện các thiết bị Android đang kết nối và cài đặt APK trực tiếp sau khi build.
- 🔥 **Deep Clean:** Xóa sạch cache `.gradle` và các artifact cũ để khắc phục các lỗi build khó chịu.
- 📁 **Mở thư mục APK:** Truy cập nhanh vào thư mục chứa sản phẩm sau khi build thành công.
- 📈 **Log thời gian thực:** Theo dõi tiến độ build và lỗi trực tiếp trên giao diện với màu sắc trực quan.
- 📋 **Lọc lỗi thông minh:** Tự động tìm kiếm và sao chép các lỗi quan trọng từ log dài để tiện tra cứu.
- 🧠 **Cấu trúc Brain (AI):** Tích hợp thư mục `.brain` lưu trữ tri thức và trạng thái làm việc cho các mô hình AI Agent hỗ trợ code.
- ⌨️ **Phím tắt nâng cao:** Ctrl+B (Build), Esc (Dừng) giúp tăng tốc quy trình làm việc.
- 🎨 **Giao diện Premium:** Thiết kế Dark Blue phong cách Apple với hiệu ứng Glassmorphism.

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- **Android SDK:** Phải được cài đặt để sử dụng ADB và Gradle.
- **Java JDK:** Gradle yêu cầu môi trường Java.
- **Go 1.22+:** (Nếu build từ nguồn).
- **Node.js:** (Nếu build từ nguồn).

### Cài đặt bản thực thi
1. Tải về phiên bản mới nhất từ [Releases](https://github.com/skul9x/ApkBuilder/releases).
2. **Windows:** Chạy file `.exe` hoặc cài đặt qua bộ cài `.exe installer`.
3. **Linux:** Cài đặt gói `.deb` bằng lệnh `sudo dpkg -i apk-builder_v1.0.0_amd64.deb`.

## 💻 Cách sử dụng

1. **Chọn thư mục:** Bấm "Thay đổi thư mục" để trỏ tới folder root của Android project.
2. **Đặt tên APK:** Nhập tên sản phẩm mong muốn (ví dụ: `MyApp_V1.0`).
3. **Tùy chọn:** Chọn phiên bản `Debug` hoặc `Release`.
4. **Build:** Nhấn nút xanh **"Khởi chạy Build"** (hoặc Ctrl+B).
5. **Cài đặt:** Sau khi build xong, nhấn **"Cài đặt"** để đẩy app vào điện thoại.

## 🏗️ Hướng dẫn Build từ nguồn

Nếu bạn là dev và muốn tự build:

```bash
# 1. Clone dự án
git clone https://github.com/skul9x/ApkBuilder.git
cd ApkBuilder

# 2. Cài đặt dependencies frontend
cd frontend
npm install
cd ..

# 3. Chạy chế độ Development
wails dev

# 4. Build sản phẩm (Window)
wails build -platform windows/amd64

# 5. Build sản phẩm (Linux)
wails build -platform linux/amd64
```

## 📂 Cấu trúc thư mục

```text
├── .brain/             # Bộ nhớ AI của dự án
├── app.go              # Logic Backend chính (Wails binds)
├── main.go             # Điểm khởi đầu ứng dụng
├── internal/           # Code xử lý logic (Builder, ADB, Config)
├── frontend/           # Mã nguồn React + Tailwind CSS
├── build/              # Asset cho đóng gói (icon, installer)
└── docs/               # Tài liệu dự án
```

## 📄 Bản quyền & Tác giả

Phát triển bởi **Nguyễn Duy Trường** © 2026.
Mọi quyền được bảo lưu.
Ứng dụng được vận hành bởi **Engine: Wails v2** & **Runtime: Go**.
