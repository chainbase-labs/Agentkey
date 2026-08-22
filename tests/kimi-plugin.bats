#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/.." && pwd)"
    MANIFEST="$REPO_ROOT/.kimi-plugin/plugin.json"
}

@test "Kimi plugin declares the AgentKey MCP server inline" {
    python3 - "$MANIFEST" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    manifest = json.load(handle)

servers = manifest.get("mcpServers")
assert isinstance(servers, dict), "mcpServers must be an inline object"
assert servers == {
    "agentkey": {
        "url": "https://api.agentkey.app/kimi/v1/mcp",
    }
}
PY
}

@test "Kimi plugin relies on native OAuth instead of static credentials" {
    python3 - "$MANIFEST" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    manifest = json.load(handle)

assert "userConfig" not in manifest
server = manifest["mcpServers"]["agentkey"]
assert "headers" not in server
assert "bearerTokenEnvVar" not in server
PY

    [ ! -e "$REPO_ROOT/.kimi-plugin/mcp.json" ]
}
