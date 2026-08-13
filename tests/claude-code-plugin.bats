#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/.." && pwd)"
    MANIFEST="$REPO_ROOT/.claude-plugin/plugin.json"
    MCP_CONFIG="$REPO_ROOT/.mcp.json"
}

@test "Claude Code plugin leaves authentication to native MCP OAuth" {
    python3 - "$MANIFEST" "$MCP_CONFIG" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    manifest = json.load(handle)
with open(sys.argv[2], encoding="utf-8") as handle:
    config = json.load(handle)

assert manifest["mcpServers"] == "./.mcp.json"
assert "userConfig" not in manifest
assert config == {
    "mcpServers": {
        "agentkey": {
            "type": "http",
            "url": "https://api.agentkey.app/v1/mcp",
        }
    }
}
server = config["mcpServers"]["agentkey"]
assert "headers" not in server
assert "headersHelper" not in server
PY
}

@test "Claude Code plugin docs expose both native OAuth entry points" {
    python3 - "$REPO_ROOT/README.md" "$REPO_ROOT/docs/README_zh.md" <<'PY'
import sys

for path in sys.argv[1:]:
    with open(path, encoding="utf-8") as handle:
        readme = " ".join(handle.read().split())

    expected_phrases = (
        "/reload-plugins",
        "/mcp",
        "**Authenticate**",
        "claude mcp login plugin:agentkey:agentkey",
    )
    for expected in expected_phrases:
        assert expected in readme, f"{path}: {expected}"
    assert "`Authorization` header" in readme, path
PY
}
