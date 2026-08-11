#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_ARG="${1:-dist/release-assets}"

case "$OUTPUT_ARG" in
    /*) OUTPUT_DIR="$OUTPUT_ARG" ;;
    *) OUTPUT_DIR="$REPO_ROOT/$OUTPUT_ARG" ;;
esac

for command_name in git tar unzip zip; do
    if ! command -v "$command_name" >/dev/null 2>&1; then
        echo "Required command not found: $command_name" >&2
        exit 1
    fi
done

mkdir -p "$OUTPUT_DIR"

ASSET_NAMES=(
    agentkey.skill
    darwin.agentkey.tar.gz
    linux.agentkey.tar.gz
    win32.agentkey.zip
)

for asset_name in "${ASSET_NAMES[@]}"; do
    rm -f "$OUTPUT_DIR/$asset_name"
done

(
    cd "$REPO_ROOT/skills/agentkey"
    zip -qr "$OUTPUT_DIR/agentkey.skill" . \
        -x "*.DS_Store" \
        -x "__pycache__/*" \
        -x "*.pyc"
)

git -C "$REPO_ROOT" archive \
    --format=tar.gz \
    --output="$OUTPUT_DIR/darwin.agentkey.tar.gz" \
    HEAD
cp "$OUTPUT_DIR/darwin.agentkey.tar.gz" "$OUTPUT_DIR/linux.agentkey.tar.gz"
git -C "$REPO_ROOT" archive \
    --format=zip \
    --output="$OUTPUT_DIR/win32.agentkey.zip" \
    HEAD

for archive_name in darwin.agentkey.tar.gz linux.agentkey.tar.gz; do
    tar -tzf "$OUTPUT_DIR/$archive_name" | grep -Fx 'gemini-extension.json' >/dev/null
    tar -tzf "$OUTPUT_DIR/$archive_name" | grep -Fx 'skills/agentkey/SKILL.md' >/dev/null
done

unzip -Z1 "$OUTPUT_DIR/win32.agentkey.zip" | grep -Fx 'gemini-extension.json' >/dev/null
unzip -Z1 "$OUTPUT_DIR/win32.agentkey.zip" | grep -Fx 'skills/agentkey/SKILL.md' >/dev/null
unzip -Z1 "$OUTPUT_DIR/agentkey.skill" | grep -Fx 'SKILL.md' >/dev/null

echo "Built release assets:"
for asset_name in "${ASSET_NAMES[@]}"; do
    echo "  $OUTPUT_DIR/$asset_name"
done
