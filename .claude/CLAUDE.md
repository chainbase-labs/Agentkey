# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

AgentKey Skill ships the agent-side half of AgentKey: a single skill that teaches Claude (and any Skills-CLI-compatible agent) how to call the AgentKey MCP tools correctly.

AgentKey has **two pieces** and a full end-user install is two commands:

1. `npx skills add chainbase-labs/agentkey` — installs **this** skill. It does NOT register the MCP server.
2. `npx -y @agentkey/mcp --auth-login` — registers the MCP server (`@agentkey/mcp` from `../AgentKey-Server/mcp-server`) and writes the API key into Claude Code, Claude Desktop, and Cursor configs.

The skill is useless without the MCP server; the MCP server works without the skill but the agent won't know to prefer it over built-in web search. Keep this mental model when editing docs — do not let either command drift into claiming it does both.

The same repo also works as a Claude Code plugin (via `.claude-plugin/plugin.json` + `.mcp.json`) for users on the plugin marketplace path; in that mode the plugin's `userConfig` + `.mcp.json` substitute for step 2.

## Directory Structure

```
agentkey/
├── .claude-plugin/plugin.json   # Claude Code plugin manifest
├── .mcp.json                    # Auto-registers AgentKey MCP when installed as a plugin
├── skills/agentkey/
│   ├── SKILL.md                 # Decision tree + routing rules (end-user facing)
│   └── scripts/                 # check-mcp / check-update helpers
├── scripts/
│   └── uninstall.sh             # End-user cleanup helper
├── archive/                     # Retired installers + CLI (incl. old release.sh), kept for history, not shipped
└── version                      # Managed by release-please only
```

`archive/` holds the old per-agent installers (OpenClaw bash installer, the custom `@agentkey-cli/cli`, inject.sh, setup-key.sh) plus the retired pnpm workspace files. They are no longer referenced from the public docs; do not resurrect them without a plan.

## Key Commands

```bash
# Test a local edit against every detected agent
npx skills add .

# Daily commit (does NOT trigger user updates)
git add -A && git commit -m "..." && git push origin main

# Publish a new release
# Releases are cut automatically by release-please on merge to main.
# To manually trigger: merge a conventional-commit PR; release-please will open
# a Release PR; merge that to tag and create the GitHub Release.

# Undo a bad release
git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z
gh release delete vX.Y.Z --repo chainbase-labs/agentkey --yes
```

Releases are driven by [release-please](https://github.com/googleapis/release-please): merged PRs with Conventional Commit messages (`feat:`, `fix:`, `feat!:`, etc.) update an open Release PR that bumps `version`, `.claude-plugin/plugin.json` version, and `CHANGELOG.md`. Merging the Release PR tags the release and creates the GitHub Release, which in turn triggers plugin updates for users.

## Version & Release Rules

- `version`, `.claude-plugin/plugin.json` version, and `CHANGELOG.md` are managed by release-please based on Conventional Commits — never edit manually except via PR that intentionally amends them.
- Tag format: `v` prefix (e.g. `v0.4.5`)
- Plugin updates trigger on **GitHub Release** publication, not on plain commits
- `npx skills update` pulls from the default branch, so main must always be shippable

## Change Checklists

**Changes to `plugin.json`:**
- release-please automatically bumps `version` + `plugin.json` version + `CHANGELOG.md` from merged conventional-commit PRs; maintainers review + merge the generated Release PR rather than editing these files directly

**Changes to `.mcp.json`:**
- Ensure env var name matches `plugin.json` userConfig key via `CLAUDE_PLUGIN_OPTION_` prefix
- Only matters for the Claude Code plugin path; the Skills-CLI path writes MCP config through `npx @agentkey/mcp --auth-login`

**Changes to install/uninstall docs:**
- Update both `README.md` and `docs/README_zh.md` together — they mirror each other
- The canonical install is always the two-command sequence (`npx skills add …` + `npx -y @agentkey/mcp --auth-login`). Don't imply either command does both.
- Do **not** re-add OpenClaw / per-agent installers without a new design — they live in `archive/`

## Architecture Constraints

- Setup mode in SKILL.md runs `! npx -y @agentkey/mcp --auth-login` to authenticate via browser — same command as step 2 of the public install
- `@agentkey/mcp --auth-login` auto-writes configs for Claude Code, Claude Desktop (mac/win), and Cursor only. Other agents need a manual JSON paste — SKILL.md's "Fallback" section covers this; keep it up to date with any new auto-targets added server-side
- `.mcp.json` auto-registers the MCP server in Claude Code plugin mode; API key flows from plugin userConfig → `CLAUDE_PLUGIN_OPTION_AGENTKEY_API_KEY` env var (read in `../AgentKey-Server/mcp-server/src/index.ts`)
- `README.md` / `docs/README_zh.md` are the public-facing docs; keep them in sync with any structural changes
