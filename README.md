# Apk Builder 🚀

**Apk Builder** là một công cụ máy tính (desktop application) mạnh mẽ và tối giản dành cho các nhà phát triển Android, giúp tự động hóa quy trình build, cài đặt và quản lý file APK. Ứng dụng được xây dựng trên nền tảng **Go (Wails v2)** cho hiệu suất cao và **React + Tailwind CSS** cho giao diện hiện đại, mượt mà.

## 🌟 Tính năng chính

- 📂 **Quản lý dự án thông minh:** Dễ dàng chọn thư mục dự án Android và tự động nhận diện cấu hình `build.gradle`.
- ⚙️ **Tự động nhận diện môi trường:** Quét và tìm kiếm Android SDK (ADB) và Java Home trên hệ thống một cách tự động.
- 🛠️ **Build Gradle một nút bấm:** Hỗ trợ lệnh `Clean`, `Assemble Debug` và `Assemble Release` chỉ với một cú click.
- 📲 **Cài đặt qua ADB:** Tự động phát hiện các thiết bị Android đang kết nối và cài đặt APK trực tiếp sau khi build thành công.
- 🔥 **Deep Clean:** Tính năng xóa sạch cache `.gradle` và các artifact cũ để sửa các lỗi build phát sinh do cache.
- 📁 **Truy cập nhanh:** Mở thư mục chứa APK ngay sau khi build để kiểm tra sản phẩm.
- 📋 **Logcat Viewer (New):** Trình xem log Android thời gian thực tích hợp, hỗ trợ luồng log lớn nhờ công nghệ **Virtualized List**.
- 💾 **Export Log:** Cho phép lưu và xuất nội dung Logcat ra file `.txt` để gửi cho đồng nghiệp hoặc debug.
- 🧠 **Cấu trúc Brain (AI):** Tích hợp thư mục `.brain` lưu trữ tri thức và lộ trình thực thi của AI Agent hỗ trợ dự án.

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- **Android SDK:** Cần được cài đặt để sử dụng ADB.
- **Java JDK:** Cần thiết để chạy các lệnh Gradle.
- **Go 1.22+** & **Node.js**: Nếu bạn muốn tự build từ mã nguồn.

### Cài đặt nhanh
1. Truy cập [Releases](https://github.com/skul9x/ApkBuilder/releases) và tải phiên bản phù hợp.
2. **Windows**: Sử dụng file `.exe` hoặc bộ cài installer.
3. **Linux**: Cài đặt gói `.deb` (`sudo dpkg -i apk-builder_v1.0.x_amd64.deb`).

## 🏗️ Build từ mã nguồn

```bash
# 1. Clone dự án
git clone https://github.com/skul9x/ApkBuilder.git
cd ApkBuilder

# 2. Cài đặt các gói phụ thuộc (Dependencies)
cd frontend && npm install && cd ..

# 3. Chạy ở chế độ Development (Yêu cầu Wails CLI)
wails dev

# 4. Build phiên bản chính thức
wails build -platform linux/amd64  # Cho Linux
wails build -platform windows/amd64 # Cho Windows
```

## 📂 Cấu trúc thư mục

```text
├── .brain/             # Tri thức và trạng thái dự án (Dành cho AI Agent)
├── .agent/              # Cấu hình AI Agent (Internal)
├── app.go              # Logic Backend (Wails Binds)
├── main.go             # Entry Point của ứng dụng
├── internal/           # Mã nguồn Go (ADB, Builder, Config)
├── frontend/           # Mã nguồn React + Tailwind CSS + TypeScript
├── build/              # Tài nguyên đóng gói (Icons, Installers)
└── plans/              # Tài liệu kế hoạch phát triển theo từng giai đoạn
```

## 🛠️ Công nghệ sử dụng

- **Backend**: Golang & Wails v2.
- **Frontend**: React 18, Vite, Tailwind CSS.
- **Tools**: ADB (Android Debug Bridge), Gradle.
- **UI Libs**: React Window (Virtualized List).

## 📄 Bản quyền & Tác giả

Phát triển bởi **Nguyễn Duy Trường** © 2026.
Phần mềm được cung cấp như hiện trạng nhằm hỗ trợ cộng đồng dev Android.

---
*Lưu ý: Thư mục `.brain` chứa các log quan trọng về tri thức của AI hỗ trợ dự án, vui lòng không xóa nếu muốn duy trì sự hỗ trợ thông minh từ Agent.*
