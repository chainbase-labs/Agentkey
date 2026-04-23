# archive/

Retired installers, tooling, and planning docs kept for history. **Not shipped, not referenced from the public install flow.** Do not resurrect any of this without first updating the canonical install path in `../README.md`.

Superseded by the two-command install:

```bash
npx skills add chainbase-labs/AgentKey-Skill
npx -y @agentkey/mcp --auth-login
```

## Contents

| Path | What it was | Superseded by |
|---|---|---|
| `cli/` | Custom `@agentkey-cli/cli` — TypeScript installer with per-agent adapters (claude-code, cursor, codex, gemini, openclaw, hermes, claude-desktop, manus) | `npx skills add` (vercel-labs/skills) |
| `scripts/install-openclaw.sh` | OpenClaw bash installer (detected version, used native MCP or mcporter) | `npx skills add` covers OpenClaw |
| `scripts/inject.sh` | Wrote an `AgentKey` routing block into `~/.claude/CLAUDE.md` | No longer needed — Claude Code plugin ships its own CLAUDE.md injection |
| `scripts/setup-key.sh` | Persisted `AGENTKEY_API_KEY` to `~/.env.local` for the MCP server to read | `npx -y @agentkey/mcp --auth-login` writes the key directly into MCP client configs |
| `pnpm-workspace.yaml`, `pnpm-lock.yaml` | Workspace config for the retired `cli/` package | — |
| `docs/OPENCLAW_INSTALL.md` | Public install guide for the OpenClaw bash installer | Main README covers all agents now |
| `docs/QA-CHECKLIST*.md`, `docs/QA-REPORT-*.md` | QA checklists that referenced the retired CLI commands | Needs a rewrite against the two-command install if re-introduced |
| `docs/superpowers/` | Planning/specs/checklists for the retired CLI installer release | — |

## Unarchiving

If you ever need to bring something back:

1. Update `../README.md` and `../docs/README_zh.md` first to describe the new flow.
2. `git mv` the file out of `archive/` into its previous home.
3. Remove the corresponding row from the table above.
