#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/.." && pwd)"
}

@test "installers detect DSH, auto-configure MCP, and exclude it from skills add -a" {
    python3 - "$REPO_ROOT/scripts/install.sh" "$REPO_ROOT/scripts/install.ps1" <<'PY'
import sys

bash = open(sys.argv[1], encoding="utf-8").read()
ps = open(sys.argv[2], encoding="utf-8").read()

assert '"dsh|path:$DSH_DETECT_HOME,cmd:dsh"' in bash
assert 'DSH_DETECT_HOME="${DSH_HOME:-}"' in bash
assert 'SKILLS_AGENT_EXCLUSIONS=(claude-desktop dsh)' in bash
assert 'amp crush droid openclaw dsh' in bash
assert "@{ Id = 'dsh'" in ps
assert "$SkillsAgentExclusions = @('claude-desktop', 'dsh')" in ps
assert "'openclaw', 'dsh'" in ps
PY
}

@test "--only dsh performs global skill install without passing dsh to -a" {
    home="$BATS_TEST_TMPDIR/install-home"
    work="$BATS_TEST_TMPDIR/install-work"
    fakebin="$BATS_TEST_TMPDIR/bin"
    mkdir -p "$home" "$work" "$fakebin"
    log="$BATS_TEST_TMPDIR/npx.log"
    cat > "$fakebin/npx" <<'SH'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "$AGENTKEY_NPX_LOG"
if [[ " $* " == *" skills add "* ]]; then
    mkdir -p "$HOME/.agents/skills/agentkey"
    printf '%s\n' '# fake skill' > "$HOME/.agents/skills/agentkey/SKILL.md"
fi
exit 0
SH
    chmod +x "$fakebin/npx"

    run env HOME="$home" DSH_HOME="$home/.dsh" AGENTKEY_NPX_LOG="$log" PATH="$fakebin:$PATH" \
        bash -c 'cd "$1" && "$2" --yes --only dsh --no-telemetry' bash "$work" "$REPO_ROOT/scripts/install.sh"

    [ "$status" -eq 0 ]
    grep -F 'skills add chainbase-labs/agentkey -g' "$log"
    ! grep -E 'skills add .* -a .*dsh|skills add .* -a dsh' "$log"
    grep -F '@agentkey/cli --auth-login --only dsh' "$log"
}

@test "--skip-mcp --only dsh does not claim that DSH hot-applied MCP" {
    home="$BATS_TEST_TMPDIR/skip-home"
    work="$BATS_TEST_TMPDIR/skip-work"
    fakebin="$BATS_TEST_TMPDIR/skip-bin"
    mkdir -p "$home" "$work" "$fakebin"
    cat > "$fakebin/npx" <<'SH'
#!/usr/bin/env bash
if [[ " $* " == *" skills add "* ]]; then
    mkdir -p "$HOME/.agents/skills/agentkey"
    printf '%s\n' '# fake skill' > "$HOME/.agents/skills/agentkey/SKILL.md"
fi
exit 0
SH
    chmod +x "$fakebin/npx"

    run env HOME="$home" DSH_HOME="$home/.dsh" PATH="$fakebin:$PATH" \
        bash -c 'cd "$1" && "$2" --yes --only dsh --skip-mcp --no-telemetry' bash "$work" "$REPO_ROOT/scripts/install.sh"

    [ "$status" -eq 0 ]
    [[ "$output" != *"hot-appl"* ]]
    [[ "$output" == *"Restart your agent"* ]]
}

@test "bash uninstaller removes only managed DSH state and legacy defaults" {
    home="$BATS_TEST_TMPDIR/uninstall-home"
    dsh="$BATS_TEST_TMPDIR/custom-dsh"
    work="$BATS_TEST_TMPDIR/uninstall-work"
    patch="$dsh/cordis.patch.yml"
    mkdir -p "$home" "$work" "$dsh" "$dsh/.agent-presets/agentkey"
    cat > "$patch" <<'YAML'
# user comment
- id: preserve-before
  enabled: true
# agentkey:start (managed by `@agentkey/cli --auth-login`)
- insert:
    - id: agentkey
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: agentkey
        headers:
          Authorization: 'Bearer fake-test-key'
# agentkey:end
- id: preserve-after
  enabled: true
YAML
    cat > "$dsh/settings.yaml" <<'YAML'
agent-presets:
  default: agentkey
  sort: recent
theme: dark
YAML
    printf '%s\n' user-custom > "$dsh/.agent-presets/agentkey/custom.yml"

    run env HOME="$home" DSH_HOME="$dsh" bash -c 'cd "$1" && "$2" --skip-skill-remove' bash "$work" "$REPO_ROOT/scripts/uninstall.sh"

    [ "$status" -eq 0 ]
    ! grep -q '# agentkey:start' "$patch"
    ! grep -q 'fake-test-key' "$patch"
    grep -q 'id: preserve-before' "$patch"
    grep -q 'id: preserve-after' "$patch"
    [ ! -e "$dsh/.agent-presets/agentkey" ]
    backup="$(find "$dsh/.agent-presets" -maxdepth 1 -name 'agentkey.backup-*' -print -quit)"
    [ -n "$backup" ]
    grep -q user-custom "$backup/custom.yml"
    ! grep -Eq '^\s*default:\s*agentkey' "$dsh/settings.yaml"
    grep -q 'sort: recent' "$dsh/settings.yaml"
    grep -q 'theme: dark' "$dsh/settings.yaml"
}

@test "bash uninstaller ignores marker-prefix collisions" {
    home="$BATS_TEST_TMPDIR/collision-home"
    dsh="$BATS_TEST_TMPDIR/collision-dsh"
    work="$BATS_TEST_TMPDIR/collision-work"
    patch="$dsh/cordis.patch.yml"
    mkdir -p "$home" "$work" "$dsh"
    printf '%s\n' '# agentkey:starter' '- id: user-plugin' '# agentkey:ending' > "$patch"
    before="$(cat "$patch")"

    run env HOME="$home" DSH_HOME="$dsh" bash -c 'cd "$1" && "$2" --skip-skill-remove' bash "$work" "$REPO_ROOT/scripts/uninstall.sh"

    [ "$status" -eq 0 ]
    [ "$(cat "$patch")" = "$before" ]
    [[ "$output" == *"No AgentKey DSH block"* ]]
}

@test "bash uninstaller preserves indented DSH block-scalar markers byte-for-byte" {
    home="$BATS_TEST_TMPDIR/scalar-home"
    dsh="$BATS_TEST_TMPDIR/scalar-dsh"
    work="$BATS_TEST_TMPDIR/scalar-work"
    patch="$dsh/cordis.patch.yml"
    before="$BATS_TEST_TMPDIR/scalar-before.yml"
    mkdir -p "$home" "$work" "$dsh"
    cat > "$patch" <<'YAML'
- insert:
    - id: user-plugin
      name: '@example/plugin'
      config:
        instructions: |
          # agentkey:start
          This is ordinary user prompt text.
          # agentkey:end
        legacyExample: |
          - id: agentkey
            name: '@deepseek-ai/dsh-mcp-client'
            config:
              serverName: example
YAML
    cp "$patch" "$before"

    run env HOME="$home" DSH_HOME="$dsh" bash -c 'cd "$1" && "$2" --skip-skill-remove' bash "$work" "$REPO_ROOT/scripts/uninstall.sh"

    [ "$status" -eq 0 ]
    cmp -s "$patch" "$before"
    [[ "$output" == *"No AgentKey DSH block"* ]]
}

@test "bash uninstaller leaves malformed DSH marker blocks unchanged" {
    home="$BATS_TEST_TMPDIR/malformed-home"
    dsh="$BATS_TEST_TMPDIR/malformed-dsh"
    work="$BATS_TEST_TMPDIR/malformed-work"
    patch="$dsh/cordis.patch.yml"
    mkdir -p "$home" "$work" "$dsh"
    printf '%s\n' '# agentkey:start (missing end)' 'keep: true' > "$patch"
    before="$(cat "$patch")"

    run env HOME="$home" DSH_HOME="$dsh" bash -c 'cd "$1" && "$2" --skip-skill-remove' bash "$work" "$REPO_ROOT/scripts/uninstall.sh"

    [ "$status" -eq 0 ]
    [ "$(cat "$patch")" = "$before" ]
    [[ "$output" == *"left unchanged"* ]]
}

@test "bash uninstaller does not rewrite a profile without AgentKey markers" {
    home="$BATS_TEST_TMPDIR/unrelated-home"
    dsh="$BATS_TEST_TMPDIR/unrelated-dsh"
    work="$BATS_TEST_TMPDIR/unrelated-work"
    patch="$dsh/profiles/web/cordis.patch.yml"
    mkdir -p "$home" "$work" "$(dirname "$patch")"
    printf '%s\n' '# user-only profile' '- id: preserve-me' '  enabled: true' > "$patch"
    before="$(cat "$patch")"

    run env HOME="$home" DSH_HOME="$dsh" bash -c 'cd "$1" && "$2" --skip-skill-remove' bash "$work" "$REPO_ROOT/scripts/uninstall.sh"

    [ "$status" -eq 0 ]
    [ "$(cat "$patch")" = "$before" ]
    [[ "$output" == *"No AgentKey DSH block"* ]]
}

@test "bash uninstaller restores DSH's empty patch array" {
    home="$BATS_TEST_TMPDIR/empty-home"
    dsh="$BATS_TEST_TMPDIR/empty-dsh"
    work="$BATS_TEST_TMPDIR/empty-work"
    patch="$dsh/profiles/web/cordis.patch.yml"
    mkdir -p "$home" "$work" "$(dirname "$patch")"
    cat > "$patch" <<'YAML'
# Created by DSH
# agentkey:start (managed by `@agentkey/cli --auth-login`)
- insert:
    - id: agentkey
      name: '@deepseek-ai/dsh-mcp-client'
# agentkey:end
YAML

    run env HOME="$home" DSH_HOME="$dsh" bash -c 'cd "$1" && "$2" --skip-skill-remove' bash "$work" "$REPO_ROOT/scripts/uninstall.sh"

    [ "$status" -eq 0 ]
    grep -q '^# Created by DSH$' "$patch"
    [ "$(grep -c '^\[\]$' "$patch")" -eq 1 ]
    ! grep -q '# agentkey:start' "$patch"
}

@test "PowerShell uninstaller mirrors DSH patch, preset, and settings cleanup" {
    python3 - "$REPO_ROOT/scripts/uninstall.ps1" <<'PY'
import sys

script = open(sys.argv[1], encoding="utf-8").read()
for expected in (
    "$env:DSH_HOME",
    "Join-Path $DshHome 'cordis.patch.yml'",
    "profiles",
    "cordis.patch.yml",
    "# agentkey:start",
    "# agentkey:end",
    ".agent-presets\\agentkey",
    "Move-Item $legacyDshPreset $presetBackup",
    "settings.yaml",
    "agent-presets\\.default",
    "default:",
):
    assert expected in script, expected
PY
}

@test "PowerShell uninstaller preserves indented DSH block-scalar markers byte-for-byte" {
    python3 - "$REPO_ROOT/scripts/uninstall.ps1" <<'PY'
import re
import sys

script = open(sys.argv[1], encoding="utf-8").read()
match = re.search(r"\$managedPattern = '([^']+)'", script)
assert match, "managedPattern assignment missing"
pattern = match.group(1)
assert "^[ \\t]*# agentkey:start" not in pattern
assert "^# agentkey:start" in pattern
assert "^# agentkey:end" in pattern
assert "-match '^# agentkey:start(?:[ \\t]|$)'" in script
assert "-match '^# agentkey:end(?:[ \\t]|$)'" in script

source = """- insert:
    - id: user-plugin
      config:
        instructions: |
          # agentkey:start
          This is ordinary user prompt text.
          # agentkey:end
        legacyExample: |
          - id: agentkey
            name: '@deepseek-ai/dsh-mcp-client'
"""
assert re.sub(pattern, "", source) == source
PY
}

@test "English and Chinese docs describe the same DSH verification contract" {
    python3 - "$REPO_ROOT/README.md" "$REPO_ROOT/docs/README_zh.md" <<'PY'
import sys

for path in sys.argv[1:]:
    text = open(path, encoding="utf-8").read()
    for expected in (
        "npx skills add chainbase-labs/agentkey -g -y",
        "npx -y @agentkey/cli --auth-login --only dsh",
        "cordis.patch.yml",
        "@deepseek-ai/dsh-mcp-client",
        "mcp__agentkey__find_tools",
        "mcp__agentkey__describe_tool",
        "mcp__agentkey__execute_tool",
        "OAuth",
        "tool policy",
        "additionalProperties",
        "symlink",
    ):
        assert expected in text, f"{path}: {expected}"
PY
}
