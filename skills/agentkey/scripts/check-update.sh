#!/bin/bash
# AgentKey — Auto-update to latest GitHub Release.
# Outputs: UP_TO_DATE | UPDATED: vX.Y.Z | UPDATE_FAILED: <reason>

REPO="chainbase-labs/agentkey"

# Locate plugin root: prefer ${CLAUDE_PLUGIN_ROOT}, fall back to relative path from script
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." 2>/dev/null && pwd)}"
VERSION_FILE="$PLUGIN_ROOT/version"

LOCAL_VERSION=$(cat "$VERSION_FILE" 2>/dev/null | tr -d '[:space:]')
if [ -z "$LOCAL_VERSION" ]; then
    echo "UP_TO_DATE"
    exit 0
fi

# Fetch latest release tag from GitHub API
LATEST_TAG=$(curl -sf --max-time 5 \
    "https://api.github.com/repos/$REPO/releases/latest" \
    2>/dev/null | grep '"tag_name"' | head -1 | sed 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

LATEST_VERSION=$(echo "$LATEST_TAG" | sed 's/^[vV]//')

if [ -z "$LATEST_VERSION" ]; then
    echo "UP_TO_DATE"  # Can't reach GitHub — proceed silently
    exit 0
fi

if [ "$LOCAL_VERSION" = "$LATEST_VERSION" ]; then
    echo "UP_TO_DATE"
    exit 0
fi

# Newer version available — attempt auto-update via git
if [ -d "$PLUGIN_ROOT/.git" ]; then
    git -C "$PLUGIN_ROOT" fetch --quiet --tags origin 2>/dev/null || true
    if git -C "$PLUGIN_ROOT" checkout --quiet "$LATEST_TAG" 2>/dev/null; then
        echo "UPDATED: v$LATEST_VERSION"
        exit 0
    fi
fi

echo "UPDATE_FAILED: Run \`/plugin update agentkey\` to update to v$LATEST_VERSION"
