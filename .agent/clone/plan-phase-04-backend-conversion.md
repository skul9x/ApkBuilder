# Phase 04 — Backend Conversion

The backend is migrating from **Python (PySide6 logic)** to **Golang (Wails backend)**.

## Framework & Structure
- **Language:** Go 1.21+
- **Architecture:** Simplified Clean Architecture (Handlers -> Services -> Domain).
- **Project Structure:**
  - `main.go`: Application entry point and Wails configuration.
  - `app.go`: Bridge between Frontend and Backend (Wails Bindings).
  - `internal/builder/`: Core logic for Gradle/ADB orchestration.
  - `internal/config/`: Settings management.
  - `internal/utils/`: Path detection and system environment helpers.

## Mapping Python to Go
| Python (main.py) | Go (internal/) |
| --- | --- |
| `AndroidBuilderApp.run_gradle()` | `builder.RunGradle(cmd string, projectPath string)` using `os/exec` |
| `AndroidBuilderApp.check_adb_devices()` | `builder.GetConnectedDevices()` |
| `AndroidBuilderApp.calculate_next_version()` | `builder.IncrementVersion(current string) string` |
| `AndroidBuilderApp.load_settings()` | `config.LoadSettings()` |
| `AndroidBuilderApp.copy_errors_only()` | `builder.ParseErrors(log string) string` |

## Execution Model
- Asynchronous commands will use Go routines.
- Progress and logs will be streamed back to the frontend via Wails Events (`runtime.EventsEmit`).
