#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/.." && pwd)"
    MANIFEST="$REPO_ROOT/plugin.json"
    MCP_CONFIG="$REPO_ROOT/mcp_config.json"
}

@test "Antigravity plugin manifest follows the documented schema" {
    python3 - "$MANIFEST" <<'PY'
import json
import re
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    manifest = json.load(handle)

assert manifest["$schema"] == "https://antigravity.google/schemas/v1/plugin.json"
assert re.fullmatch(r"[a-zA-Z0-9-_]+", manifest["name"])
assert manifest["name"] == "agentkey"
assert manifest["description"]
assert set(manifest) == {"$schema", "name", "description"}
assert "version" not in manifest
PY
}

@test "Antigravity plugin declares remote MCP with serverUrl" {
    python3 - "$MCP_CONFIG" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    config = json.load(handle)

assert config == {
    "mcpServers": {
        "agentkey": {
            "serverUrl": "https://api.agentkey.app/v1/mcp",
        }
    }
}
server = config["mcpServers"]["agentkey"]
assert "url" not in server
assert "httpUrl" not in server
PY
}

@test "Antigravity plugin relies on automatic OAuth discovery" {
    python3 - "$MCP_CONFIG" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    server = json.load(handle)["mcpServers"]["agentkey"]

assert "headers" not in server
assert "oauth" not in server
assert "authProviderType" not in server
PY
}

@test "Antigravity desktop and CLI share the existing AgentKey skill" {
    [ -f "$REPO_ROOT/skills/agentkey/SKILL.md" ]

    python3 - "$REPO_ROOT/skills/agentkey/SKILL.md" <<'PY'
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    skill = handle.read()

frontmatter = skill.split("---", 2)[1]
assert "\nname: agentkey\n" in f"\n{frontmatter}\n"
PY
}

@test "Plugin endpoints follow the client-attributed route contract" {
    python3 - "$REPO_ROOT" <<'PY'
import json
import os
import sys

root = sys.argv[1]
configs = {
    "claude": (".mcp.json", "url"),
    "codex": (".codex-plugin/mcp.json", "url"),
    "cursor": (".cursor-plugin/plugin.json", "url"),
    "kimi": (".kimi-plugin/plugin.json", "url"),
    "gemini": ("gemini-extension.json", "httpUrl"),
    "antigravity": ("mcp_config.json", "serverUrl"),
}
endpoints = {}
for client, (relative_path, field) in configs.items():
    with open(os.path.join(root, relative_path), encoding="utf-8") as handle:
        endpoints[client] = json.load(handle)["mcpServers"]["agentkey"][field]

assert endpoints == {
    "claude": "https://api.agentkey.app/v1/mcp",
    "codex": "https://api.agentkey.app/v1/mcp",
    "cursor": "https://api.agentkey.app/v1/mcp",
    "kimi": "https://api.agentkey.app/kimi/v1/mcp",
    "gemini": "https://api.agentkey.app/v1/mcp",
    "antigravity": "https://api.agentkey.app/v1/mcp",
}, endpoints
PY
}
