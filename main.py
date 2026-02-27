import sys
import os
import platform
import subprocess
import re
import shutil
import json
from datetime import datetime
from PySide6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                               QHBoxLayout, QPushButton, QLabel, QFileDialog, 
                               QTextEdit, QProgressBar, QMessageBox, QGroupBox,
                               QComboBox, QCheckBox, QToolBar, QLineEdit)
from PySide6.QtCore import QProcess, Qt, QProcessEnvironment, QTimer
from PySide6.QtGui import QFont, QTextCursor, QAction

# Tên file lưu cấu hình
SETTINGS_FILE = "builder_settings.json"

class AndroidBuilderApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Android Builder Pro v6.2 (Smart Error Copy)")
        self.resize(1100, 920)
        
        # Biến trạng thái
        self.project_path = ""
        self.captured_errors = []
        self.adb_path = "adb"
        self.settings = self.load_settings()

        # Process chính
        self.process = QProcess(self)
        self.process.readyReadStandardOutput.connect(self.handle_stdout)
        self.process.readyReadStandardError.connect(self.handle_stderr)
        self.process.finished.connect(self.process_finished)

        # Timer check thiết bị
        self.device_timer = QTimer()
        self.device_timer.timeout.connect(self.check_adb_devices)
        self.device_timer.start(3000)

        # Detect System
        self.detected_java_home = self.find_java_home()
        self.detected_sdk_home = self.find_android_sdk()
        if self.detected_sdk_home:
            ext = ".exe" if platform.system() == "Windows" else ""
            p_adb = os.path.join(self.detected_sdk_home, "platform-tools", f"adb{ext}")
            if os.path.exists(p_adb): self.adb_path = p_adb

        self.setup_ui()
        self.apply_stylesheet()
        self.log_system_status()

        # Resume Last Project
        last_proj = self.settings.get("last_project", "")
        if last_proj and os.path.exists(last_proj):
            self.log(f"🔄 Đang khôi phục dự án: {last_proj}", "info")
            self.load_project(last_proj)

    def setup_ui(self):
        toolbar = QToolBar("Tools")
        self.addToolBar(toolbar)
        toolbar.addAction(QAction("💾 Lưu Log ra file", self, triggered=self.save_log_to_file))
        toolbar.addAction(QAction("🔥 Deep Clean", self, triggered=self.deep_clean_project))

        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QVBoxLayout(main_widget)
        layout.setSpacing(12)
        layout.setContentsMargins(15, 15, 15, 15)

        # --- Section 1: Project & Config ---
        top_group = QGroupBox("Cấu hình dự án")
        top_layout = QVBoxLayout()
        
        # Path Selector
        path_layout = QHBoxLayout()
        self.lbl_path = QLabel("Chưa chọn dự án...")
        btn_browse = QPushButton("📁 Chọn Folder Project")
        btn_browse.clicked.connect(self.select_folder)
        path_layout.addWidget(self.lbl_path, stretch=1)
        path_layout.addWidget(btn_browse)
        top_layout.addLayout(path_layout)
        
        # Versioning Input
        name_layout = QHBoxLayout()
        name_layout.addWidget(QLabel("Tên APK đầu ra:"))
        self.txt_apk_name = QLineEdit()
        self.txt_apk_name.setPlaceholderText("Ví dụ: MyApp_V1.0.0")
        self.txt_apk_name.setStyleSheet("padding: 5px; color: #FFF; background: #444; border: 1px solid #555;")
        btn_save_name = QPushButton("💾 Lưu Tên")
        btn_save_name.setFixedWidth(100)
        btn_save_name.setStyleSheet("background-color: #607D8B; color: white;")
        btn_save_name.clicked.connect(self.save_apk_name_config)
        name_layout.addWidget(self.txt_apk_name)
        name_layout.addWidget(btn_save_name)
        top_layout.addLayout(name_layout)

        # Config Params
        config_layout = QHBoxLayout()
        config_layout.addWidget(QLabel("Chế độ Build:"))
        self.combo_variant = QComboBox()
        self.combo_variant.addItems(["Debug", "Release"])
        config_layout.addWidget(self.combo_variant)
        
        # Checkbox Refresh Dependencies
        self.chk_refresh = QCheckBox("Force Refresh Dependencies")
        config_layout.addWidget(self.chk_refresh)

        # --- FEATURE: Delete Old APKs ---
        self.chk_delete_old = QCheckBox("Xóa APK các phiên bản cũ")
        self.chk_delete_old.setToolTip("Sau khi build xong bản mới, tool sẽ xóa các file .apk cũ trong thư mục output để tiết kiệm SSD.")
        self.chk_delete_old.setChecked(True) 
        config_layout.addWidget(self.chk_delete_old)
        
        config_layout.addStretch()
        
        self.lbl_device_status = QLabel("🔴 Checking...")
        self.lbl_device_status.setStyleSheet("color: #777;")
        config_layout.addWidget(self.lbl_device_status)
        
        top_layout.addLayout(config_layout)
        top_group.setLayout(top_layout)
        layout.addWidget(top_group)

        # --- Section 2: Actions ---
        action_layout = QHBoxLayout()
        self.btn_clean = self.create_button("🧹 Clean", "#FF9800", lambda: self.run_gradle("clean"))
        self.btn_build = self.create_button("🔨 Build APK", "#4CAF50", self.start_build)
        self.btn_install = self.create_button("📲 Install", "#2196F3", self.install_apk)
        self.btn_stop = self.create_button("🛑 Stop", "#F44336", lambda: self.run_gradle("--stop"))
        
        action_layout.addWidget(self.btn_clean)
        action_layout.addWidget(self.btn_build)
        action_layout.addWidget(self.btn_install)
        action_layout.addWidget(self.btn_stop)
        layout.addLayout(action_layout)

        # --- Section 3: Progress & Log ---
        self.progress_bar = QProgressBar()
        self.progress_bar.hide()
        layout.addWidget(self.progress_bar)

        self.console_log = QTextEdit()
        self.console_log.setReadOnly(True)
        self.console_log.setStyleSheet("background-color: #1E1E1E; color: #E0E0E0; font-family: Consolas; font-size: 13px;")
        layout.addWidget(self.console_log)
        
        # --- Bottom Buttons ---
        bottom_layout = QHBoxLayout()

        # NÚT MỚI: COPY ERRORS ONLY (Màu đỏ)
        self.btn_copy_err = QPushButton("📋 Copy Errors Only")
        self.btn_copy_err.setMinimumHeight(40)
        self.btn_copy_err.setStyleSheet("background-color: #D32F2F; color: white; font-weight: bold; border-radius: 5px;")
        self.btn_copy_err.setCursor(Qt.PointingHandCursor)
        self.btn_copy_err.clicked.connect(self.copy_errors_only)
        
        btn_open_dir = QPushButton("📂 Mở thư mục chứa APK")
        btn_open_dir.setMinimumHeight(40)
        btn_open_dir.setStyleSheet("background-color: #555; color: white; border-radius: 5px;")
        btn_open_dir.setCursor(Qt.PointingHandCursor)
        btn_open_dir.clicked.connect(self.open_apk_folder)

        bottom_layout.addWidget(self.btn_copy_err)
        bottom_layout.addWidget(btn_open_dir)
        layout.addLayout(bottom_layout)

    def create_button(self, text, color, function):
        btn = QPushButton(text)
        btn.setCursor(Qt.PointingHandCursor)
        btn.setMinimumHeight(45)
        btn.setFont(QFont("Segoe UI", 10, QFont.Bold))
        btn.setStyleSheet(f"background-color: {color}; color: white; border-radius: 5px;")
        btn.clicked.connect(function)
        return btn

    def apply_stylesheet(self):
        self.setStyleSheet("""
            QMainWindow { background-color: #2D2D2D; }
            QLabel, QCheckBox { color: #FFF; }
            QGroupBox { color: #40C4FF; font-weight: bold; border: 1px solid #555; margin-top: 10px; }
            QComboBox { padding: 5px; background: #444; color: white; border: 1px solid #555; }
            QToolBar { border: none; background: #333; }
        """)

    # --- Feature: Smart Copy (Errors Only) ---
    def copy_errors_only(self):
        full_log = self.console_log.toPlainText()
        if not full_log:
            return QMessageBox.warning(self, "Copy", "Log đang trống!")

        # Các từ khóa nhận diện lỗi quan trọng
        keywords = ["e: file", "error:", "FAILED", "FAILURE:", "Exception", "Execution failed", "What went wrong", "Caused by:"]
        
        filtered_lines = []
        is_capturing_stacktrace = False

        for line in full_log.splitlines():
            clean_line = line.strip()
            
            # Logic lọc: Nếu dòng chứa từ khóa lỗi -> Lấy luôn
            if any(k in clean_line for k in keywords):
                filtered_lines.append(line)
                # Nếu gặp Exception, bật chế độ lấy thêm các dòng giải thích sau đó
                if "Exception" in clean_line or "What went wrong" in clean_line or "FAILED" in clean_line:
                    is_capturing_stacktrace = True
            
            # Lấy thêm các dòng phụ giải thích (thường bắt đầu bằng dấu > hoặc *)
            elif is_capturing_stacktrace and (clean_line.startswith(">") or clean_line.startswith("*") or clean_line.startswith("at ")):
                filtered_lines.append(line)
            else:
                # Gặp dòng bình thường thì dừng lấy stacktrace (để tránh lấy nhầm các dòng task success)
                if clean_line and not clean_line.startswith(">") and not clean_line.startswith("*"):
                    is_capturing_stacktrace = False

        if filtered_lines:
            final_text = "\n".join(filtered_lines)
            clipboard = QApplication.clipboard()
            clipboard.setText(final_text)
            self.log(f"✅ Đã lọc và copy {len(filtered_lines)} dòng lỗi quan trọng vào Clipboard!", "success")
        else:
            # Nếu không tìm thấy lỗi (có thể do Build Success), hỏi user
            reply = QMessageBox.question(self, "Không tìm thấy lỗi", 
                                       "Tool không phát hiện từ khóa lỗi nào.\nBạn có muốn copy TOÀN BỘ log không?",
                                       QMessageBox.Yes | QMessageBox.No)
            if reply == QMessageBox.Yes:
                QApplication.clipboard().setText(full_log)
                self.log("✅ Đã copy toàn bộ log.", "info")

    # --- Settings & JSON ---
    def load_settings(self):
        if os.path.exists(SETTINGS_FILE):
            try:
                with open(SETTINGS_FILE, 'r', encoding='utf-8') as f: return json.load(f)
            except: pass
        return {"last_project": "", "projects": {}}

    def save_settings(self):
        try:
            with open(SETTINGS_FILE, 'w', encoding='utf-8') as f: json.dump(self.settings, f, indent=4, ensure_ascii=False)
        except: pass

    def save_apk_name_config(self):
        if not self.project_path: return
        name = self.txt_apk_name.text().strip()
        if not name: return QMessageBox.warning(self, "Lỗi", "Vui lòng nhập tên file!")
        if "projects" not in self.settings: self.settings["projects"] = {}
        self.settings["projects"][self.project_path] = name
        self.save_settings()
        self.log(f"✅ Đã lưu cấu hình tên: {name}", "success")

    # --- Versioning Logic ---
    def calculate_next_version(self, current_name):
        pattern = r"_V(\d+)\.(\d+)\.(\d+)$"
        match = re.search(pattern, current_name)
        if match:
            x, y, z = map(int, match.groups())
            z += 1
            if z > 9: z = 0; y += 1
            if y > 9: y = 0; x += 1
            return f"{current_name[:match.start()]}_V{x}.{y}.{z}"
        
        match_short = re.search(r"_V(\d+)\.(\d+)$", current_name)
        if match_short: return f"{current_name}.0"
        
        return f"{current_name}_V1.0.0"

    # --- Core Logic ---
    def select_folder(self):
        folder = QFileDialog.getExistingDirectory(self, "Chọn thư mục dự án")
        if folder: self.load_project(folder)

    def load_project(self, folder_path):
        if os.path.exists(os.path.join(folder_path, "build.gradle")) or os.path.exists(os.path.join(folder_path, "build.gradle.kts")):
            self.project_path = folder_path
            self.lbl_path.setText(folder_path)
            self.ensure_local_properties()
            
            saved_projects = self.settings.get("projects", {})
            if folder_path in saved_projects:
                self.txt_apk_name.setText(saved_projects[folder_path])
            else:
                self.txt_apk_name.clear()
            
            self.settings["last_project"] = folder_path
            self.save_settings()
            self.log(f"📂 Project Loaded: {folder_path}", "info")
        else:
            self.log("⚠️ Thư mục không hợp lệ (thiếu build.gradle)", "error")

    def start_build(self):
        if not self.project_path: return
        variant = self.combo_variant.currentText()
        flags = " --refresh-dependencies" if self.chk_refresh.isChecked() else ""
        self.run_gradle(f"assemble{variant}{flags}")

    def run_gradle(self, command):
        if not self.project_path: return QMessageBox.warning(self, "Lỗi", "Chưa chọn dự án!")
        self.captured_errors = []
        wrapper = "gradlew.bat" if platform.system() == "Windows" else "./gradlew"
        env = QProcessEnvironment.systemEnvironment()
        if self.detected_java_home:
            env.insert("JAVA_HOME", self.detected_java_home)
            sep = ";" if platform.system() == "Windows" else ":"
            env.insert("PATH", os.path.join(self.detected_java_home, "bin") + sep + env.value("PATH"))
        if self.detected_sdk_home: env.insert("ANDROID_HOME", self.detected_sdk_home)

        self.process.setProcessEnvironment(env)
        self.toggle_ui(busy=True)
        self.console_log.clear()
        self.log(f"🚀 RUN: {wrapper} {command}", "info")
        self.process.setWorkingDirectory(self.project_path)
        self.process.start(os.path.join(self.project_path, wrapper), command.split())

    def process_finished(self):
        self.toggle_ui(busy=False)
        if self.process.exitCode() == 0:
            self.log("\n✅ BUILD SUCCESS!", "success")
            if "assemble" in str(self.process.arguments()):
                self.handle_post_build_rename()
        else:
            self.log(f"\n❌ FAILED (Code {self.process.exitCode()})", "error")
            if self.captured_errors:
                if not any("INSTALL_FAILED" in err for err in self.captured_errors):
                    QMessageBox.critical(self, "Lỗi Build", "\n".join(self.captured_errors[:10]))

    def handle_post_build_rename(self):
        current_name_config = self.txt_apk_name.text().strip()
        if not current_name_config: return

        variant = self.combo_variant.currentText().lower()
        output_dir = os.path.join(self.project_path, "app", "build", "outputs", "apk", variant)
        original_apk = os.path.join(output_dir, f"app-{variant}.apk")
        
        # Fallback find apk
        if not os.path.exists(original_apk) and os.path.exists(output_dir):
            files = [f for f in os.listdir(output_dir) if f.endswith(".apk") and "unaligned" not in f]
            if files: original_apk = os.path.join(output_dir, files[0])
        
        if os.path.exists(original_apk):
            target_name = current_name_config if current_name_config.endswith(".apk") else f"{current_name_config}.apk"
            target_path = os.path.join(output_dir, target_name)
            
            try:
                shutil.copy2(original_apk, target_path)
                self.log(f"📦 Đã tạo file: {target_name}", "success")
                
                # --- FEATURE: DELETE OLD APKS ---
                if self.chk_delete_old.isChecked():
                    self.log("🗑️ Đang dọn dẹp APK phiên bản cũ...", "info")
                    deleted_count = 0
                    for f in os.listdir(output_dir):
                        if f.endswith(".apk"):
                            # Logic: Xóa nếu không phải là file vừa tạo VÀ không phải là file gốc app-debug.apk
                            if f != target_name and f != f"app-{variant}.apk":
                                try:
                                    os.remove(os.path.join(output_dir, f))
                                    deleted_count += 1
                                except: pass
                    if deleted_count > 0:
                        self.log(f"✅ Đã xóa {deleted_count} file cũ để tiết kiệm SSD.", "success")
                # -------------------------------

                # Auto Increment Logic
                name_no_ext = current_name_config.replace(".apk", "")
                next_name = self.calculate_next_version(name_no_ext)
                self.txt_apk_name.setText(next_name)
                
                if "projects" not in self.settings: self.settings["projects"] = {}
                self.settings["projects"][self.project_path] = next_name
                self.save_settings()
                self.log(f"🆙 Next Version: {next_name}", "info")
                
            except Exception as e:
                self.log(f"⚠️ Lỗi copy/xóa file: {e}", "error")

    # --- Helpers ---
    def install_apk(self):
        variant = self.combo_variant.currentText().lower()
        apk_path = os.path.join(self.project_path, "app", "build", "outputs", "apk", variant, f"app-{variant}.apk")
        if not os.path.exists(apk_path): return self.log("⚠️ Không tìm thấy file gốc để cài.", "error")
        self.toggle_ui(busy=True)
        self.log("📲 Đang cài đặt...", "info")
        self.process.start(self.adb_path, ["install", "-r", apk_path])

    def handle_stdout(self):
        self.log(bytes(self.process.readAllStandardOutput()).decode("utf-8", errors="ignore"), "raw")

    def handle_stderr(self):
        text = bytes(self.process.readAllStandardError()).decode("utf-8", errors="ignore")
        if "INSTALL_FAILED_UPDATE_INCOMPATIBLE" in text:
            match = re.search(r"Existing package ([\w\.]+) signatures", text)
            if match: QTimer.singleShot(100, lambda: self.ask_uninstall(match.group(1)))
        self.scan_errors(text)
        self.log(text, "error")

    def ask_uninstall(self, pkg):
        if QMessageBox.question(self, "Xung đột App", f"Gỡ bản cũ của '{pkg}'?", QMessageBox.Yes|QMessageBox.No) == QMessageBox.Yes:
            subprocess.call([self.adb_path, "uninstall", pkg])
            self.log("✅ Đã gỡ xong! Bấm Install lại.", "success")

    def scan_errors(self, text):
        for line in text.splitlines():
            if re.search(r'(FAILED|ERROR:|Execution failed|Exception)', line, re.IGNORECASE):
                if len(line.strip()) > 10: self.captured_errors.append(line.strip())

    def toggle_ui(self, busy):
        self.btn_build.setDisabled(busy)
        if busy: self.progress_bar.show()
        else: self.progress_bar.hide()

    def log_system_status(self): pass

    def log(self, message, type="raw"):
        cursor = self.console_log.textCursor()
        cursor.movePosition(QTextCursor.End)
        color = "#FFF"
        if type == "error": color = "#FF5252"
        elif type == "info": color = "#40C4FF"
        elif type == "success": color = "#69F0AE"
        if type == "raw": self.console_log.insertPlainText(message)
        else: self.console_log.insertHtml(f'<br><span style="color:{color}; font-weight:bold;">{message}</span><br>')
        self.console_log.ensureCursorVisible()

    def find_java_home(self):
        env = os.environ.get("JAVA_HOME")
        if env and os.path.exists(env): return env
        if platform.system() == "Windows":
            for p in [r"C:\Program Files\Android\Android Studio\jbr", r"C:\Program Files\Java\jdk-17"]:
                if os.path.exists(p): return p
        return None

    def find_android_sdk(self):
        env = os.environ.get("ANDROID_HOME")
        if env and os.path.exists(env): return env
        if platform.system() == "Windows": return os.path.join(os.environ.get("LOCALAPPDATA", ""), "Android", "Sdk")
        return None

    def ensure_local_properties(self):
        if not self.project_path or not self.detected_sdk_home: return
        p = os.path.join(self.project_path, "local.properties")
        if not os.path.exists(p):
            with open(p, "w") as f: f.write(f"sdk.dir={self.detected_sdk_home.replace(os.sep, '/')}")
    
    def check_adb_devices(self):
        # 1. Tự động tìm lại ADB nếu đường dẫn hiện tại không chạy được
        if not self.adb_path or self.adb_path == "adb":
            for potential_adb in ["adb", "/usr/bin/adb", os.path.expanduser("~/Android/Sdk/platform-tools/adb")]:
                if shutil.which(potential_adb):
                    self.adb_path = potential_adb
                    break

        if not self.adb_path:
            self.lbl_device_status.setText("🔴 ADB not found")
            return

        try:
            # 2. Chạy lệnh với thiết lập an toàn cho từng OS
            kwargs = {}
            if platform.system() == 'Windows':
                kwargs['creationflags'] = 0x08000000
            
            proc = subprocess.Popen(
                [self.adb_path, "devices"], 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE,
                **kwargs
            )
            out, err = proc.communicate(timeout=3)
            output = out.decode('utf-8', errors='ignore')
            
            if "List of devices" in output:
                lines = [l.strip() for l in output.splitlines() if l.strip() and "List of devices" not in l]
                device_count = len(lines)
                
                if device_count > 0:
                    self.lbl_device_status.setText(f"🟢 {device_count} Device{'s' if device_count > 1 else ''}")
                    self.lbl_device_status.setStyleSheet("color: #69F0AE; font-weight: bold;")
                else:
                    self.lbl_device_status.setText("🔴 No Device")
                    self.lbl_device_status.setStyleSheet("color: #FF5252;")
            else:
                self.lbl_device_status.setText("⚠️ ADB Response Err")
                self.lbl_device_status.setStyleSheet("color: #FFA726;")
                
        except subprocess.TimeoutExpired:
            self.lbl_device_status.setText("⏳ ADB Timeout")
        except Exception as e:
            # Hiện lỗi thật lên UI để thám tử dễ làm việc
            err_msg = str(e)
            self.lbl_device_status.setText(f"❌ {err_msg[:20]}")
            self.lbl_device_status.setStyleSheet("color: #FF5252;")
            print(f"[ADB Check Error] {e}")

    def save_log_to_file(self):
        content = self.console_log.toPlainText()
        if not content: return
        fn, _ = QFileDialog.getSaveFileName(self, "Save Log", f"log.txt")
        if fn: 
            with open(fn, 'w', encoding='utf-8') as f: f.write(content)

    def deep_clean_project(self):
        if not self.project_path: return
        if QMessageBox.question(self, "Deep Clean", "Xóa cache build?", QMessageBox.Yes|QMessageBox.No) == QMessageBox.Yes:
            try:
                shutil.rmtree(os.path.join(self.project_path, "app", "build"), ignore_errors=True)
                shutil.rmtree(os.path.join(self.project_path, ".gradle"), ignore_errors=True)
                self.log("Cleaned!", "success")
            except: pass

    def open_apk_folder(self):
        if not self.project_path: return
        variant = self.combo_variant.currentText().lower()
        d = os.path.join(self.project_path, "app", "build", "outputs", "apk", variant)
        if os.path.exists(d): os.startfile(d) if platform.system()=="Windows" else subprocess.call(["xdg-open", d])

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = AndroidBuilderApp()
    window.show()
    sys.exit(app.exec())