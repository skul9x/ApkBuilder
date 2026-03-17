package builder

import (
	"strings"
)

type LogType string

const (
	LogInfo    LogType = "info"
	LogSuccess LogType = "success"
	LogError   LogType = "error"
	LogRaw     LogType = "raw"
)

type LogEntry struct {
	Type    LogType `json:"type"`
	Message string  `json:"message"`
}

func ParseErrors(fullLog string) string {
	keywords := []string{"e: file", "error:", "FAILED", "FAILURE:", "Exception", "Execution failed", "What went wrong", "Caused by:"}
	lines := strings.Split(fullLog, "\n")
	
	var filtered []string
	isCapturing := false

	for _, line := range lines {
		clean := strings.TrimSpace(line)
		
		isError := false
		for _, k := range keywords {
			if strings.Contains(clean, k) {
				isError = true
				break
			}
		}

		if isError {
			filtered = append(filtered, line)
			if strings.Contains(clean, "Exception") || strings.Contains(clean, "What went wrong") || strings.Contains(clean, "FAILED") {
				isCapturing = true
			}
		} else if isCapturing && (strings.HasPrefix(clean, ">") || strings.HasPrefix(clean, "*") || strings.HasPrefix(clean, "at ")) {
			filtered = append(filtered, line)
		} else {
			if clean != "" && !strings.HasPrefix(clean, ">") && !strings.HasPrefix(clean, "*") {
				isCapturing = false
			}
		}
	}

	return strings.Join(filtered, "\n")
}
