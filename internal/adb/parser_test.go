package adb

import (
	"testing"
)

func TestParseLogLine(t *testing.T) {
	// Test dòng chuẩn - Debug
	line1 := "12-25 15:30:45.123  5042  5042 D ActivityThread: BIND_APPLICATION handled : 0"
	entry1 := ParseLogLine(line1)
	if entry1 == nil {
		t.Fatal("Expected entry, got nil")
	}
	if entry1.Timestamp != "12-25 15:30:45.123" || entry1.Level != "D" || entry1.Tag != "ActivityThread" || entry1.Message != "BIND_APPLICATION handled : 0" {
		t.Errorf("Failed to parse line 1. Got: %+v", entry1)
	}

	// Test Error Stacktrace (nó có khoảng trắng thụt đầu dòng trong tag/message)
	line2 := "03-20 08:45:24.123 1234 5678 E AndroidRuntime:     at com.example.MainActivity.onCreate(MainActivity.java:12)"
	entry2 := ParseLogLine(line2)
	if entry2 == nil || entry2.Level != "E" || entry2.Tag != "AndroidRuntime" {
		t.Errorf("Failed to parse stacktrace line. Got: %+v", entry2)
	}

	// Test dòng rác hệ thống
	line3 := "--------- beginning of crash"
	entry3 := ParseLogLine(line3)
	if entry3 != nil {
		t.Errorf("Expected nil for beginning info, got %+v", entry3)
	}
}
