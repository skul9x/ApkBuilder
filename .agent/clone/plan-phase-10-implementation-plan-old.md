# Migration Plan
See the core implementation plan under `/home/skul9x/.gemini/antigravity/brain/cba8019e-b3e6-47e1-a5da-9c72303f5b2f/implementation_plan.md` for full implementation and testing structures.

The backend will be rewritten entirely in Golang, maintaining parity with all CLI executions and log scanning string logics originally present in `AndroidBuilderApp` PySide6 module.
The schema logic for `builder_settings.json` is perfectly retained.
The user must pick a desktop renderer stack.
