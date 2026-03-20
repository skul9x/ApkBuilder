# Phase 07 — API Design (Wails Bindings)

Since this is a desktop app, "API" refers to the Go methods exposed to the JS frontend.

## Exposed Methods
| Method | Description |
| --- | --- |
| `SelectFolder()` | Opens a native OS directory picker. |
| `LoadProject(path string)` | Validates and returns project-specific config. |
| `RunGradle(cmd string)` | Starts a background process for clean/build. |
| `InstallApk()` | Triggers ADB installation logic. |
| `DeepClean()` | Deletes build artifacts manually. |
| `SaveConfig(config map)`| Persists the current settings to disk. |
| `GetVersion()` | Returns the current app version. |

## Data Formats
- Responses will follow a unified `Result` struct: `{ success: bool, data: any, error: string }`.
- Real-time logging will be handled via Events rather than return values.
