#!/bin/bash
# AgentKey Skill — Release Script (for maintainers)
# Usage: ./scripts/release.sh [patch|minor|major] "Release notes"
# Example: ./scripts/release.sh patch "Fixed typo in twitter.md"
#          ./scripts/release.sh minor "Added LinkedIn platform support"
#          ./scripts/release.sh major "Breaking: restructured skill directory"
#
# NOTE: The version file should start at 0.0.0.
# First `minor` release → v0.1.0, first `patch` → v0.0.1, first `major` → v1.0.0
#
# Requires: git, gh (GitHub CLI, logged in)
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
VERSION_FILE="$REPO_DIR/version"

BUMP_TYPE="${1:-patch}"
NOTES="${2:-Release $BUMP_TYPE}"

# Abort if there are uncommitted changes (excluding version and plugin.json which we'll bump)
if [ -n "$(cd "$REPO_DIR" && git diff --name-only HEAD -- ':!version' ':!.claude-plugin/plugin.json')" ] || \
   [ -n "$(cd "$REPO_DIR" && git diff --cached --name-only HEAD -- ':!version' ':!.claude-plugin/plugin.json')" ] || \
   [ -n "$(cd "$REPO_DIR" && git ls-files --others --exclude-standard)" ]; then
    echo "  ✗ Uncommitted changes detected. Commit or stash them before releasing."
    echo ""
    (cd "$REPO_DIR" && git status --short)
    exit 1
fi

if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo "Usage: $0 [patch|minor|major] \"Release notes\""
    echo ""
    echo "  patch  0.1.0 → 0.1.1  (bug fixes, typo corrections)"
    echo "  minor  0.1.0 → 0.2.0  (new features, new platforms)"
    echo "  major  0.1.0 → 1.0.0  (breaking changes)"
    exit 1
fi

# Read current version
CURRENT=$(cat "$VERSION_FILE" 2>/dev/null | tr -d '[:space:]')
if [ -z "$CURRENT" ]; then
    echo "Error: Cannot read version from $VERSION_FILE"
    exit 1
fi

# Parse semver
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
MAJOR=${MAJOR:-0}
MINOR=${MINOR:-0}
PATCH=${PATCH:-0}

# Bump
case "$BUMP_TYPE" in
    patch) PATCH=$((PATCH + 1)) ;;
    minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
    major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
TAG="v$NEW_VERSION"

echo ""
echo "  Release: v$CURRENT → $TAG"
echo "  Notes:   $NOTES"
echo ""

# Confirm
read -p "  Proceed? [y/N] " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "  Aborted."
    exit 0
fi

# Update version file
echo "$NEW_VERSION" > "$VERSION_FILE"

# Update plugin.json version
PLUGIN_JSON="$REPO_DIR/.claude-plugin/plugin.json"
if [ -f "$PLUGIN_JSON" ] && command -v python3 &>/dev/null; then
    python3 - <<EOF
import json
with open('$PLUGIN_JSON', 'r') as f:
    d = json.load(f)
d['version'] = '$NEW_VERSION'
with open('$PLUGIN_JSON', 'w') as f:
    json.dump(d, f, indent=2)
    f.write('\n')
EOF
fi

cd "$REPO_DIR"

# Sync cli/package.json version with root version file
if [[ -f cli/package.json ]]; then
  node -e "
    const fs=require('fs');
    const p=JSON.parse(fs.readFileSync('cli/package.json','utf8'));
    p.version=process.argv[1];
    fs.writeFileSync('cli/package.json', JSON.stringify(p,null,2)+'\n');
  " "$NEW_VERSION"
  git add cli/package.json
fi

# Commit + tag
git add version .claude-plugin/plugin.json
git commit -m "release: $TAG — $NOTES"
git tag -a "$TAG" -m "$NOTES"

echo ""
echo "  ✓ Version bumped to $TAG"
echo "  ✓ Tag created: $TAG"

# Push main + tags — use gh auth credential helper so both HTTPS and SSH remotes work
echo "  → Pushing to GitHub..."
git -c credential.helper='!gh auth git-credential' push origin main --tags --quiet
echo "  ✓ Pushed to GitHub"

# Build agentkey.skill zip (flat structure: SKILL.md at root)
SKILL_ZIP="$REPO_DIR/agentkey.skill"
SKILL_SRC="$REPO_DIR/skills/agentkey"
echo "  → Building agentkey.skill..."
rm -f "$SKILL_ZIP"
cd "$SKILL_SRC"
zip -r "$SKILL_ZIP" . -x "*.DS_Store" -x "__pycache__/*" -x "*.pyc" > /dev/null
cd "$REPO_DIR"
echo "  ✓ agentkey.skill built"

# Create GitHub Release automatically via gh CLI
if command -v gh &>/dev/null; then
    echo "  → Creating GitHub Release..."

    # Determine if this is a pre-release (0.x.x is still considered stable here)
    PRERELEASE_FLAG=""
    # Uncomment below to mark 0.x.x releases as pre-release:
    # [ "$MAJOR" -eq 0 ] && PRERELEASE_FLAG="--prerelease"

    gh release create "$TAG" \
        --repo "$(git remote get-url origin | sed 's|https://github.com/||;s|\.git$||')" \
        --title "$TAG" \
        --notes "$NOTES" \
        $PRERELEASE_FLAG \
        --verify-tag \
        "$SKILL_ZIP"

    echo "  ✓ GitHub Release created: $(gh release view "$TAG" --json url -q .url 2>/dev/null || echo $TAG)"
else
    echo ""
    echo "  ⚠ gh CLI not found. Create the release manually:"
    echo "    https://github.com/chainbase-labs/AgentKey-Skill/releases/new?tag=$TAG"
fi

# Clean up local zip
rm -f "$SKILL_ZIP"

# (The legacy `@agentkey-cli/cli` publish step was retired when the skills CLI
#  took over. The package source lives in archive/cli/ for history.)

echo ""
echo "  🎉 $TAG is live!"
echo ""
