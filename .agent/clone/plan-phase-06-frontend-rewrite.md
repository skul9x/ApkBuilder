# Phase 06 — Frontend Rewrite

The frontend is migrating from **PySide6 (Qt)** to **React + TypeScript + Tailwind CSS** (via Wails).

## Tech Stack
- **Framework:** React 18
- **Styling:** Tailwind CSS (for modern, responsive, and stunning UI)
- **State Management:** React Hooks (Core state for project path, version, logs)
- **Bindings:** Wails-generated JS/TS bindings.

## Component Structure
- `App.tsx`: Main layout and state orchestration.
- `Sidebar/Toolbar`: Quick actions (Clean, Build, Stop).
- `ProjectConfig`: Folder selector and versioning inputs.
- `ConsoleLog`: Virtualized or auto-scrolling log window with color-coded lines.
- `StatusBar`: Device count and progress bar.

## Visual Improvements
- Dark mode by default (matching the original "Android Builder Pro" aesthetic but more refined).
- Smooth transitions during build state changes.
- Modern typography (Inter or Roboto).
