# Phase 08 — Testing Strategy

Ensuring the new Go version behaves exactly like the Python version.

## Unit Testing (Go)
- **Versioning:** Test `IncrementVersion("App_V1.0.9")` returns `"App_V1.1.0"`.
- **Parsing:** Mock Gradle stderr output containing errors and verify `ParseErrors` extracts only the relevant lines.
- **Config:** Test JSON marshalling/unmarshalling of existing `builder_settings.json` samples.

## Manual Verification (E2E)
- **Path Handling:** Verify folder selection works on Linux (and Windows if possible).
- **Build Flow:** Run a full Gradle build of a test Android app.
- **ADB Flow:** Connect a physical device and test `adb install`.
- **UI Parity:** Compare side-by-side with PySide6 app to ensure no features are missing.
