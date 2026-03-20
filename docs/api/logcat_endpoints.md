# Logcat API Documentation

## Methods

### StartLogcat(deviceID string) string
Starts the ADB logcat stream for the specified device. Emits "onNativeLog" events.

### StopLogcat() string
Stops the active ADB logcat stream.

### GetLogcatDevices() []adb.Device
Returns a list of connected devices.

### ExportLogcat(logsToExport string) string
Opens a save dialog and writes the provided logs to a text file.
