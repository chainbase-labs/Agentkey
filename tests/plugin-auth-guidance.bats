#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/.." && pwd)"
    SKILL="$REPO_ROOT/skills/agentkey/SKILL.md"
    SETUP_GUIDE="$REPO_ROOT/skills/agentkey/references/setup.md"
}

@test "AgentKey skill authenticates bundled MCP entries before registering another server" {
    python3 - "$SKILL" <<'PY'
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    skill = handle.read()

assert "Authenticate the bundled entry" in skill
assert "do not register a duplicate server" in skill
assert "do not run the standalone AgentKey CLI" in skill
PY
}

@test "Gemini extension setup gives an explicit OAuth and verification flow" {
    python3 - "$SETUP_GUIDE" <<'PY'
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    guide = " ".join(handle.read().split())

for expected in (
    "### Gemini CLI extension",
    "/extensions list",
    "/mcp auth agentkey",
    "/mcp reload",
    "/mcp list",
    "Gemini gives user skills higher precedence than extension skills",
):
    assert expected in guide, expected
PY
}

@test "Antigravity setup gives desktop and CLI OAuth flows without credentials" {
    python3 - "$SETUP_GUIDE" <<'PY'
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    guide = " ".join(handle.read().split())

for expected in (
    "### Antigravity plugin",
    "Settings → Customizations → Installed MCP Servers",
    "click **Authenticate** next to AgentKey",
    "**Antigravity CLI:** open `/mcp`",
    "dynamic client registration",
    "Do not put OAuth client secrets, access tokens, or an `Authorization` header",
):
    assert expected in guide, expected
PY
}

@test "English and Chinese public docs mirror both client auth flows" {
    python3 - "$REPO_ROOT/README.md" "$REPO_ROOT/docs/README_zh.md" <<'PY'
import sys

for path in sys.argv[1:]:
    with open(path, encoding="utf-8") as handle:
        readme = " ".join(handle.read().split())

    for expected in (
        "/mcp auth agentkey",
        "/mcp reload",
        "/mcp list",
        "gemini skills uninstall agentkey --scope user",
        "Settings → Customizations → Installed MCP Servers",
        "dynamic registration endpoint",
    ):
        assert expected in readme, f"{path}: {expected}"
PY
}
