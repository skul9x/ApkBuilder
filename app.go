package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"Apk-Builder-Go/internal/builder"
	"Apk-Builder-Go/internal/config"
	"Apk-Builder-Go/internal/utils"
	"Apk-Builder-Go/internal/adb"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
	"runtime"
)

// App struct
type App struct {
	ctx           context.Context
	settings      *config.Settings
	sdkHome       string
	javaHome      string
	logcatManager *adb.LogcatManager
}

// NewApp creates a new App application struct
func NewApp() *App {
	settings, _ := config.Load()
	sdkHome := utils.FindAndroidSDK()
	return &App{
		settings:      settings,
		sdkHome:       sdkHome,
		javaHome:      utils.FindJavaHome(),
		logcatManager: adb.NewLogcatManager(sdkHome),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	if a.logcatManager != nil {
		a.logcatManager.SetContext(ctx)
	}
}

func (a *App) SelectFolder() string {
	folder, err := wailsRuntime.OpenDirectoryDialog(a.ctx, wailsRuntime.OpenDialogOptions{
		Title: "Chọn thư mục dự án Android",
	})
	if err != nil || folder == "" {
		return ""
	}
	return folder
}

func (a *App) LoadProject(path string) map[string]string {
	// Check build.gradle
	gradle := filepath.Join(path, "build.gradle")
	gradleKts := filepath.Join(path, "build.gradle.kts")
	if _, err := os.Stat(gradle); os.IsNotExist(err) {
		if _, err := os.Stat(gradleKts); os.IsNotExist(err) {
			return map[string]string{"error": "Thư mục không hợp lệ (thiếu build.gradle)"}
		}
	}

	a.settings.LastProject = path
	a.settings.Save()

	apkName := ""
	if name, ok := a.settings.Projects[path]; ok {
		apkName = name
	}

	return map[string]string{
		"path":     path,
		"apk_name": apkName,
	}
}

func (a *App) SaveApkName(path string, name string) {
	if a.settings.Projects == nil {
		a.settings.Projects = make(map[string]string)
	}
	a.settings.Projects[path] = name
	a.settings.Save()
}

func (a *App) RunGradle(projectPath string, command string) string {
	go builder.RunGradle(a.ctx, projectPath, command, a.javaHome, a.sdkHome)
	return "Đã bắt đầu"
}

func (a *App) DeepClean(projectPath string) string {
	os.RemoveAll(filepath.Join(projectPath, "app", "build"))
	os.RemoveAll(filepath.Join(projectPath, ".gradle"))
	return "Hoàn tất"
}

func (a *App) StopGradle(projectPath string) {
	go builder.RunGradle(a.ctx, projectPath, "--stop", a.javaHome, a.sdkHome)
}

func (a *App) InstallApk(projectPath string, variant string) string {
	variant = strings.ToLower(variant)
	apkPath := filepath.Join(projectPath, "app", "build", "outputs", "apk", variant, fmt.Sprintf("app-%s.apk", variant))
	if _, err := os.Stat(apkPath); os.IsNotExist(err) {
		return "⚠️ Không tìm thấy file APK để cài!"
	}
	
	adb := utils.GetADBPath(a.sdkHome)
	cmd := exec.Command(adb, "install", "-r", apkPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Sprintf("❌ Lỗi: %s\n%s", err.Error(), string(output))
	}
	return "✅ Đã cài đặt xong!"
}

func (a *App) OpenApkFolder(projectPath string, variant string) string {
	variant = strings.ToLower(variant)
	path := filepath.Join(projectPath, "app", "build", "outputs", "apk", variant)
	
	// Check if folder exists
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return "⚠️ Thư mục không tồn tại. Hãy build trước!"
	}

	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("explorer", path)
	case "darwin":
		cmd = exec.Command("open", path)
	default: // linux and others
		cmd = exec.Command("xdg-open", path)
	}

	if err := cmd.Run(); err != nil {
		return fmt.Sprintf("❌ Lỗi mở thư mục: %s", err.Error())
	}
	return "✅ Đã mở thư mục!"
}

func (a *App) GetDeviceCount() int {
	adb := utils.GetADBPath(a.sdkHome)
	count, _ := builder.GetConnectedDevices(adb)
	return count
}

func (a *App) ParseErrors(log string) string {
	return builder.ParseErrors(log)
}

func (a *App) IncrementVersion(current string) string {
	return builder.CalculateNextVersion(current)
}

func (a *App) GetGoVersion() string {
	return runtime.Version()
}

// Logcat Features
func (a *App) GetLogcatDevices() []adb.Device {
	if a.logcatManager == nil {
		return []adb.Device{}
	}
	return a.logcatManager.GetConnectedDevices()
}

func (a *App) StartLogcat(deviceID string) string {
	err := a.logcatManager.StartLogcat(deviceID)
	if err != nil {
		return fmt.Sprintf("Error starting logcat: %v", err)
	}
	return "Logcat stream started for target: " + deviceID
}

func (a *App) StopLogcat() string {
	err := a.logcatManager.StopLogcat()
	if err != nil {
		return fmt.Sprintf("Error stopping logcat: %v", err)
	}
	return "Logcat stream stopped"
}

// ExportLogcat saves the provided log string to a text file
func (a *App) ExportLogcat(logsToExport string) string {
	filepath, err := wailsRuntime.SaveFileDialog(a.ctx, wailsRuntime.SaveDialogOptions{
		Title:           "Save Logcat",
		DefaultFilename: "logcat.txt",
		Filters: []wailsRuntime.FileFilter{
			{DisplayName: "Text Files (*.txt)", Pattern: "*.txt"},
		},
	})
	if err != nil || filepath == "" {
		return "Đã hủy lưu file."
	}

	err = os.WriteFile(filepath, []byte(logsToExport), 0644)
	if err != nil {
		return fmt.Sprintf("❌ Lỗi lưu file: %v", err)
	}
	return fmt.Sprintf("✅ Đã lưu log tại: %s", filepath)
}
