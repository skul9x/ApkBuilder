package builder

import (
	"testing"
)

func TestCalculateNextVersion(t *testing.T) {
	tests := []struct {
		current  string
		expected string
	}{
		{"App", "App_V1.0.0"},
		{"App_V1.0.0", "App_V1.0.1"},
		{"App_V1.0.9", "App_V1.1.0"},
		{"App_V1.9.9", "App_V2.0.0"},
		{"App_V1.2", "App_V1.2.0"},
	}

	for _, tt := range tests {
		result := CalculateNextVersion(tt.current)
		if result != tt.expected {
			t.Errorf("CalculateNextVersion(%s) = %s; want %s", tt.current, result, tt.expected)
		}
	}
}
