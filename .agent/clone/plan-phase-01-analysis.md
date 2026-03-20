# Source Project Analysis

The original application is a standalone desktop utility named "Android Builder Pro" for managing and building Android Gradle projects.

**Source Analysis**
- **Backend:** Standalone Python Application executing CLI processes asynchronously
- **Frontend:** PySide6 (Qt for Python)
- **Database:** Local JSON file (`builder_settings.json`) for persistence
- **Auth:** None
- **Build / Packaging:** PyInstaller (instructions in `donggoi.txt`)
- **Language:** Python 3
- **External Dependencies:** `adb`, `gradlew`, Java, Android SDK
