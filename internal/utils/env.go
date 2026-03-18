package utils

import (
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

func FindJavaHome() string {
	if env := os.Getenv("JAVA_HOME"); env != "" {
		return env
	}
	
	var paths []string
	if runtime.GOOS == "windows" {
		paths = []string{
			`C:\Program Files\Android\Android Studio\jbr`,
			`C:\Program Files\Android\Android Studio\jre`,
			`C:\Program Files\Java\jdk-21`,
			`C:\Program Files\Java\jdk-17`,
			`C:\Program Files\Java\jdk-11`,
		}
	} else if runtime.GOOS == "linux" {
		home, _ := os.UserHomeDir()
		paths = []string{
			filepath.Join(home, "android-studio", "jbr"),
			"/usr/lib/jvm/default-java",
			"/usr/lib/jvm/java-17-openjdk-amd64",
			"/usr/lib/jvm/java-11-openjdk-amd64",
		}
	}

	for _, p := range paths {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return ""
}

func FindAndroidSDK() string {
	if env := os.Getenv("ANDROID_HOME"); env != "" {
		return env
	}
	if env := os.Getenv("ANDROID_SDK_ROOT"); env != "" {
		return env
	}

	var paths []string
	home, _ := os.UserHomeDir()

	if runtime.GOOS == "windows" {
		paths = []string{
			filepath.Join(os.Getenv("LOCALAPPDATA"), "Android", "Sdk"),
			`C:\Android\sdk`,
			`C:\Program Files (x86)\Android\android-sdk`,
		}
	} else if runtime.GOOS == "linux" {
		paths = []string{
			filepath.Join(home, "Android", "Sdk"),
			filepath.Join(home, "android-sdk"),
			"/usr/lib/android-sdk",
			"/opt/android-sdk",
		}
	}

	for _, p := range paths {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return ""
}

func GetADBPath(sdkHome string) string {
	ext := ""
	if runtime.GOOS == "windows" {
		ext = ".exe"
	}

	if sdkHome != "" {
		p := filepath.Join(sdkHome, "platform-tools", "adb"+ext)
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}

	// Falls back to system PATH
	if p, err := exec.LookPath("adb" + ext); err == nil {
		return p
	}

	return "adb"
}
