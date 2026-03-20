package adb

import (
	"bufio"
	"context"
	"io"
	"os/exec"
	"strings"
	"sync"
	"Apk-Builder-Go/internal/utils"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type Device struct {
	ID    string `json:"id"`
	State string `json:"state"`
}

type LogcatManager struct {
	ctx           context.Context
	sdkHome       string
	activeProcess *exec.Cmd
	mu            sync.Mutex
}

func NewLogcatManager(sdkHome string) *LogcatManager {
	return &LogcatManager{
		sdkHome: sdkHome,
	}
}

func (m *LogcatManager) SetContext(ctx context.Context) {
	m.ctx = ctx
}

// GetConnectedDevices returns a list of connected Android devices
func (m *LogcatManager) GetConnectedDevices() []Device {
	adbPath := utils.GetADBPath(m.sdkHome)
	cmd := exec.Command(adbPath, "devices")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return []Device{}
	}

	var devices []Device
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		// Bỏ qua dòng header
		if trimmed != "" && !strings.Contains(trimmed, "List of devices") {
			parts := strings.Fields(trimmed)
			if len(parts) >= 2 {
				devices = append(devices, Device{
					ID:    parts[0],
					State: parts[1],
				})
			}
		}
	}
	return devices
}

// StartLogcat begins streaming logcat for a specific device. (Phase 01)
func (m *LogcatManager) StartLogcat(deviceID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Stop existing process if any
	if m.activeProcess != nil && m.activeProcess.Process != nil {
		m.activeProcess.Process.Kill()
		m.activeProcess = nil
	}

	adbPath := utils.GetADBPath(m.sdkHome)
	
	// -v threadtime: Chuẩn format để phase 02 regex bóc tách
	m.activeProcess = exec.Command(adbPath, "-s", deviceID, "logcat", "-v", "threadtime")
	
	stdout, err := m.activeProcess.StdoutPipe()
	if err != nil {
		return err
	}
	
	err = m.activeProcess.Start()
	if err != nil {
		m.activeProcess = nil
		return err
	}

	// Goroutine read loop
	go func() {
		reader := bufio.NewReader(stdout)
		for {
			line, err := reader.ReadString('\n')
			if err != nil {
				if err == io.EOF {
					break // Process bị kill/thoát
				}
				break
			}
			
			// Phase 02: Gọi Parse bóc tách Model JSON
			entry := ParseLogLine(line)
			if entry != nil {
				wailsRuntime.EventsEmit(m.ctx, "onNativeLog", entry)
			}
		}
	}()

	return nil
}

// StopLogcat terminates the background ADB process
func (m *LogcatManager) StopLogcat() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.activeProcess != nil && m.activeProcess.Process != nil {
		err := m.activeProcess.Process.Kill()
		m.activeProcess = nil
		return err
	}
	return nil
}
