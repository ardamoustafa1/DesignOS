#!/usr/bin/env bash
# DesignOS reference checker — verifies every `dir/file.md` cross-reference resolves.
# memory/*.md references are virtual (per-project files) and skipped by design.
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0
while IFS= read -r ref; do
  case "$ref" in
    memory/*) continue ;;  # virtual per-project files (memory/README.md protocol)
  esac
  if [ ! -f "$ref" ]; then
    echo "BROKEN REF: $ref"
    fail=1
  fi
done < <(grep -rhoE '`[a-z-]+/[a-z0-9./-]+\.md`' --include="*.md" . | tr -d '`' | sort -u)

if [ "$fail" -eq 0 ]; then
  echo "check-refs: clean"
fi
exit "$fail"
