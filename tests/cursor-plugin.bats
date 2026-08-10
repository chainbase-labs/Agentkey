#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/.." && pwd)"
    MARKETPLACE="$REPO_ROOT/.cursor-plugin/marketplace.json"
    ROOT_MANIFEST="$REPO_ROOT/.cursor-plugin/plugin.json"
    MARKETPLACE_PLUGIN="$REPO_ROOT/plugins/agentkey"
    MARKETPLACE_MANIFEST="$MARKETPLACE_PLUGIN/.cursor-plugin/plugin.json"
}

@test "Cursor team marketplace exposes AgentKey from a repository-local plugin directory" {
    python3 - "$MARKETPLACE" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    marketplace = json.load(handle)

assert marketplace["name"] == "agentkey"
assert marketplace["owner"] == {"name": "Chainbase Labs"}
assert marketplace["metadata"]["description"]
assert len(marketplace["plugins"]) == 1

plugin = marketplace["plugins"][0]
assert plugin["name"] == "agentkey"
assert plugin["source"] == "./plugins/agentkey"
assert not isinstance(plugin["source"], dict)
PY

    [ -f "$MARKETPLACE_MANIFEST" ]
}

@test "Cursor marketplace plugin bundles its skill and remote MCP server" {
    python3 - "$MARKETPLACE_MANIFEST" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    manifest = json.load(handle)

assert manifest["name"] == "agentkey"
assert manifest["skills"] == "./skills/"
assert manifest["mcpServers"] == {
    "agentkey": {
        "url": "https://api.agentkey.app/v1/mcp",
    }
}
PY

    [ -f "$MARKETPLACE_PLUGIN/skills/agentkey/SKILL.md" ]
}

@test "Cursor marketplace entry and nested plugin manifest names stay synchronized" {
    python3 - "$MARKETPLACE" "$MARKETPLACE_MANIFEST" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    marketplace = json.load(handle)
with open(sys.argv[2], encoding="utf-8") as handle:
    manifest = json.load(handle)

assert marketplace["plugins"][0]["name"] == manifest["name"]
PY
}

@test "Cursor root and marketplace plugin manifests stay synchronized" {
    cmp "$ROOT_MANIFEST" "$MARKETPLACE_MANIFEST"
}

@test "Cursor marketplace skill copy stays synchronized with the canonical skill" {
    diff -ru --exclude version.txt \
        "$REPO_ROOT/skills/agentkey" \
        "$MARKETPLACE_PLUGIN/skills/agentkey"
    [ ! -e "$MARKETPLACE_PLUGIN/skills/agentkey/version.txt" ]
}
