package utils

import (
	"os"
	"path/filepath"
	"runtime"
)

func FindJavaHome() string {
	if env := os.Getenv("JAVA_HOME"); env != "" {
		return env
	}
	if runtime.GOOS == "windows" {
		paths := []string{
			`C:\Program Files\Android\Android Studio\jbr`,
			`C:\Program Files\Java\jdk-17`,
		}
		for _, p := range paths {
			if _, err := os.Stat(p); err == nil {
				return p
			}
		}
	}
	return ""
}

func FindAndroidSDK() string {
	if env := os.Getenv("ANDROID_HOME"); env != "" {
		return env
	}
	if runtime.GOOS == "windows" {
		return filepath.Join(os.Getenv("LOCALAPPDATA"), "Android", "Sdk")
	}
	return ""
}

func GetADBPath(sdkHome string) string {
	if sdkHome == "" {
		return "adb"
	}
	ext := ""
	if runtime.GOOS == "windows" {
		ext = ".exe"
	}
	p := filepath.Join(sdkHome, "platform-tools", "adb"+ext)
	if _, err := os.Stat(p); err == nil {
		return p
	}
	return "adb"
}
