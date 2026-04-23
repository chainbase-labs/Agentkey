# @agentkey-cli/cli

Cross-host installer for the AgentKey skill and MCP server. Installs into Claude Code, Cursor, Codex CLI, Gemini CLI, OpenClaw, Hermes, Claude Desktop, and Manus.

## Usage

```bash
npx @agentkey-cli/cli install      # interactive
npx @agentkey-cli/cli update       # pull latest source
npx @agentkey-cli/cli uninstall    # remove from hosts
npx @agentkey-cli/cli status       # show installed hosts
```

The package also registers an `agentkey` bin, so once installed you can run:

```bash
agentkey install
agentkey update
agentkey uninstall
agentkey status
```

## Non-interactive

```bash
npx @agentkey-cli/cli install \
  --agents claude-code,cursor,codex \
  --scope global \
  --method symlink \
  --api-key "$AGENTKEY_API_KEY" \
  --yes
```

| Flag | Values | Default |
|---|---|---|
| `--agents` | Comma list: claude-code, cursor, codex, gemini, openclaw, hermes, claude-desktop, manus | (interactive if omitted) |
| `--scope` | global, project | global |
| `--method` | symlink, copy | symlink |
| `--api-key` | Your AgentKey API key | `$AGENTKEY_API_KEY` |
| `--yes` | Skip confirmation | off |
| `--dry-run` | Print summary, no changes | off |
| `--verbose` | Detailed logging | off |

## Source of truth

The installer keeps a clone at `~/.agentkey/repo/` and symlinks each host's skill directory into it, so `agentkey update` makes changes visible to all hosts on the next agent restart.
