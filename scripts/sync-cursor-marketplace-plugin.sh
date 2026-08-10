#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$REPO_ROOT/skills/agentkey"
TARGET_DIR="$REPO_ROOT/plugins/agentkey/skills/agentkey"

mkdir -p "$TARGET_DIR"
rsync -a --delete --delete-excluded --exclude version.txt "$SOURCE_DIR/" "$TARGET_DIR/"
