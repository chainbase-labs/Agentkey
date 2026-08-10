#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_MANIFEST="$REPO_ROOT/.cursor-plugin/plugin.json"
SOURCE_DIR="$REPO_ROOT/skills/agentkey"
TARGET_MANIFEST="$REPO_ROOT/plugins/agentkey/.cursor-plugin/plugin.json"
TARGET_DIR="$REPO_ROOT/plugins/agentkey/skills/agentkey"

mkdir -p "$(dirname "$TARGET_MANIFEST")" "$TARGET_DIR"
rsync -a "$SOURCE_MANIFEST" "$TARGET_MANIFEST"
rsync -a --delete --delete-excluded --exclude version.txt "$SOURCE_DIR/" "$TARGET_DIR/"
