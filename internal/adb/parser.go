package adb

import (
	"regexp"
	"strings"
)

// LogEntry đại diện cho một dòng log chuẩn đã được làm sạch
type LogEntry struct {
	Timestamp string `json:"timestamp"`
	PID       string `json:"pid"`
	TID       string `json:"tid"`
	Level     string `json:"level"`
	Tag       string `json:"tag"`
	Message   string `json:"message"`
}

// Regex format của `adb logcat -v threadtime`
// Ví dụ: 12-25 15:30:45.123  5042  5042 D ActivityThread: BIND_APPLICATION handled : 0
var logPattern = regexp.MustCompile(`^(\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3})\s+(\d+)\s+(\d+)\s+([VDIWEF])\s+(.*?)\s*:\s+(.*)$`)

// ParseLogLine chuyển đổi một chuỗi raw text từ ADB thành đối tượng JSON có cấu trúc
func ParseLogLine(line string) *LogEntry {
	line = strings.TrimSpace(line)
	// Bỏ qua các dòng rác hệ thống báo bắt đầu buffer
	if line == "" || strings.HasPrefix(line, "--------- beginning of") {
		return nil
	}

	matches := logPattern.FindStringSubmatch(line)
	if len(matches) == 7 {
		return &LogEntry{
			Timestamp: matches[1],
			PID:       matches[2],
			TID:       matches[3],
			Level:     matches[4],
			Tag:       strings.TrimSpace(matches[5]),
			Message:   matches[6],
		}
	}

	// Fallback trường hợp log không theo chuẩn (ví dụ ADB báo lỗi disconnected)
	return &LogEntry{
		Level:   "U", // Unknown format
		Message: line,
	}
}
