# Phase 05 — Database Strategy

The "database" is a local JSON configuration file.

## Schema Analysis
The existing `builder_settings.json` uses a simple key-value structure:
- `last_project`: String (path)
- `projects`: Map[string]string (path -> apk_name_config)

## Strategy: Reuse Schema
We will **reuse the exact same schema** to ensure zero data loss and immediate compatibility with existing user data.

## Migration Steps
1. The Go app will look for `builder_settings.json` in the current working directory.
2. If it doesn't exist, it will initialize an empty one.
3. If it exists, it will parse it into a Go `struct` matching the JSON tags.
4. No structural changes are needed as the current schema is efficient for this scale.
