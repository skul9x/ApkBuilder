# Phase 10 — Implementation Plan

Step-by-step roadmap for rewriting ApkBuilder in Go/Wails.

## Phase 1: Environment Setup
- [ ] Install Wails and dependencies.
- [ ] Scaffold project `Apk-Builder-Go` with React + TS template.
- [ ] Configure `go.mod` and project structure.

## Phase 2: Core Backend Logic
- [ ] Implement `config` service for `builder_settings.json`.
- [ ] Implement `system` service for SDK detection.
- [ ] Implement `builder` service for executing Gradle/ADB commands.
- [ ] Implement regex-based version increment and log parsing.

## Phase 3: Frontend Foundations
- [ ] Set up Tailwind CSS.
- [ ] Create layout (Main window, Sidebar, Log area).
- [ ] Bind Go methods to JS hooks.

## Phase 4: Integration
- [ ] Connect log streaming from backend routines to frontend console.
- [ ] Implement folder picker and project loading.
- [ ] Implement build/clean/install action buttons.

## Phase 5: Polish & Test
- [ ] Add loading indicators and progress bar.
- [ ] Refine error colors and console formatting.
- [ ] Run unit tests and manual V-tests.
