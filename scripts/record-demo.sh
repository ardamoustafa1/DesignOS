#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/press/demo-terminal.txt"

node "$ROOT/scripts/demo-session.js" | perl -pe 's/\e\[[0-9;]*[A-Za-z]//g' > "$OUT"

cat <<MSG
Wrote $OUT

For a real launch GIF/MP4, record this command in a terminal recorder:

  node scripts/demo-session.js

Capture settings:
- 1280x720 terminal
- dark theme
- 18-22pt monospace
- crop to terminal only
- export MP4 plus GIF
MSG
