# Feature List

1. **Project Selection & Validation:** Browse for a project folder, auto-check for the existence of `build.gradle` or `build.gradle.kts` and apply initial configuration (like local.properties update).
2. **Version Management & Auto-increment:** Input custom output APK name and automatically append / increment `_Vx.y.z` versioning scheme per build.
3. **Gradle Orchestration:** UI controls to trigger Gradle commands: `clean`, `assembleDebug/Release`, and `--stop` with `--refresh-dependencies` flag toggle.
4. **Environment Auto-Detection:** Automatically locates `JAVA_HOME` and `ANDROID_HOME` ensuring tools like `adb` and `gradlew` can be run seamlessly.
5. **Smart Error Log Parsing:** Parse the standard error output of Gradle tasks, intelligently locate actual build errors / stack traces, and copy specifically the relevant failed sections to the clipboard.
6. **Device & ADB Management:** Real-time polling to count connected adb devices. Features to auto-install APKs via `adb install` and handle `INSTALL_FAILED_UPDATE_INCOMPATIBLE` by un-installing existing conflicting packages.
7. **Post-Build File Management:** Post-build, the tool copies the artifact to the specific parsed version name. Optional toggle to automatically clear out old `.apk` files from the output directory to save SSD space.
8. **App Persistence State:** Reads and writes `builder_settings.json` storing the last opened project and the specific target name per project loaded in the past.
9. **Log & Console Sync:** Captures stdout and stderr from the Python QProcess and injects beautifully formatted raw text (with success/error colored tags) into a UI text console that can be exported to a `.txt` log file.
10. **Deep Clean:** Force deletes `/app/build` and `/.gradle` directories locally if gradle cache is fully corrupted.
