package builder

import (
	"bufio"
	"context"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

func RunGradle(ctx context.Context, projectPath string, command string, javaHome string, sdkHome string) error {
	wrapper := "./gradlew"
	if runtime.GOOS == "windows" {
		wrapper = "gradlew.bat"
	}

	fullPath := filepath.Join(projectPath, wrapper)
	cmdArgs := strings.Fields(command)
	cmd := exec.CommandContext(ctx, fullPath, cmdArgs...)
	cmd.Dir = projectPath

	env := os.Environ()
	if javaHome != "" {
		env = append(env, "JAVA_HOME="+javaHome)
		sep := ":"
		if runtime.GOOS == "windows" {
			sep = ";"
		}
		path := filepath.Join(javaHome, "bin") + sep + os.Getenv("PATH")
		env = append(env, "PATH="+path)
	}
	if sdkHome != "" {
		env = append(env, "ANDROID_HOME="+sdkHome)
	}
	cmd.Env = env

	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	if err := cmd.Start(); err != nil {
		return err
	}

	streamOutput := func(r io.Reader, logType string) {
		scanner := bufio.NewScanner(r)
		for scanner.Scan() {
			wailsRuntime.EventsEmit(ctx, "log", LogEntry{
				Type:    LogType(logType),
				Message: scanner.Text(),
			})
		}
	}

	go streamOutput(stdout, "raw")
	go streamOutput(stderr, "error")

	err := cmd.Wait()
	if err == nil {
		wailsRuntime.EventsEmit(ctx, "log", LogEntry{Type: "success", Message: "BUILD THÀNH CÔNG!"})
	} else {
		wailsRuntime.EventsEmit(ctx, "log", LogEntry{Type: "error", Message: "BUILD THẤT BẠI!"})
	}

	return err
}

func GetConnectedDevices(adbPath string) (int, error) {
	cmd := exec.Command(adbPath, "devices")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return 0, err
	}

	lines := strings.Split(string(output), "\n")
	count := 0
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed != "" && !strings.Contains(trimmed, "List of devices") && strings.HasSuffix(trimmed, "device") {
			count++
		}
	}
	return count, nil
}
