# Architecture Analysis

**Source Architecture**
- **Type:** Desktop Application
- **Estimated Size:** Small (< 500 lines of Python code, purely a logic orchestration GUI wrapper).
- **Core Pattern:** Monolithic Event-Driven GUI.
  - The `AndroidBuilderApp` class orchestrates everything.
  - State holds config arrays and paths.
  - `QProcess` runs external CLI commands (Gradle, ADB) as background asynchronous tasks, emitting `stdout` and `stderr` up to the UI logic.
- **Data Layer:** Flat JSON file storing dictionaries of project paths to configurations.

**Target Architecture Proposal (Golang)**
- **Type:** Desktop Application (Go)
- **Design Pattern:** Hexagonal / Clean Architecture-lite
  - `domain`: Handles APK, Project Path, Versioning Regex Logic, Gradle Log Parser interfaces
  - `infrastructure`: ADB Process runner, Gradle Process runner, OS path finders (detect Java/SDK), JSON Local Storage wrapper.
  - `application`: Use cases like `BuildApk`, `InstallApk`, `DeepClean`, `ParseErrors`.
  - `ui/frontend`: Frontend bindings to Go context.

**Database Strategy**
- **Option 1 (Chosen):** Reuse database schema.
  - The existing schema (`builder_settings.json` with keys `last_project` and `projects`) is extremely simple. We will keep writing/reading to standard `builder_settings.json` locally to seamlessly preserve users' history configurations.
