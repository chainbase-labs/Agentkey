#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/.." && pwd)"
    MANIFEST="$REPO_ROOT/gemini-extension.json"
}

@test "Gemini extension declares the AgentKey Streamable HTTP server inline" {
    python3 - "$MANIFEST" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    manifest = json.load(handle)

assert manifest["name"] == "agentkey"
assert manifest["description"]
assert manifest["mcpServers"] == {
    "agentkey": {
        "httpUrl": "https://api.agentkey.app/v1/mcp",
        "oauth": {
            "enabled": True,
        },
    }
}
PY
}

@test "Gemini extension requests native OAuth while relying on dynamic discovery" {
    python3 - "$MANIFEST" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    manifest = json.load(handle)

assert "settings" not in manifest
server = manifest["mcpServers"]["agentkey"]
assert "headers" not in server
assert server["oauth"] == {"enabled": True}
assert "authorizationUrl" not in server["oauth"]
assert "tokenUrl" not in server["oauth"]
assert "clientId" not in server["oauth"]
assert "clientSecret" not in server["oauth"]
assert "authProviderType" not in server
assert "trust" not in server
PY
}

@test "Gemini extension bundles the existing AgentKey skill" {
    [ -f "$REPO_ROOT/skills/agentkey/SKILL.md" ]

    python3 - "$REPO_ROOT/skills/agentkey/SKILL.md" <<'PY'
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    skill = handle.read()

frontmatter = skill.split("---", 2)[1]
assert "\nname: agentkey\n" in f"\n{frontmatter}\n"
PY
}
