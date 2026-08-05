# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

AgentKey Skill ships the agent-side half of AgentKey: a single skill that teaches Claude (and any Skills-CLI-compatible agent) how to call the AgentKey MCP tools correctly.

AgentKey has **two pieces** and a full end-user install is two commands:

1. `npx skills add chainbase-labs/agentkey` — installs **this** skill. It does NOT register the MCP server.
2. `npx -y @agentkey/cli --auth-login` — runs the AgentKey CLI (`@agentkey/cli` from `../AgentKey-Server/cli`). It mints an API key via device-code login and writes a remote-HTTP MCP block (pointing at `https://api.agentkey.app/v1/mcp`) into Claude Code, Claude Desktop, and Cursor configs. The hosted MCP server itself lives at `/v1/mcp` on AgentKey-Server.

The skill is useless without the MCP server; the MCP server works without the skill but the agent won't know to prefer it over built-in web search. Keep this mental model when editing docs — do not let either command drift into claiming it does both.

The same repo also works as a Claude Code plugin (via `.claude-plugin/plugin.json` + `.mcp.json`) for users on the plugin marketplace path; in that mode the plugin's `userConfig` + `.mcp.json` substitute for step 2.

It additionally works as a **Codex plugin** (via `.codex-plugin/plugin.json` + `.codex-plugin/mcp.json`, distributed through `.agents/plugins/marketplace.json` — the repo is its own marketplace, added with `codex plugin marketplace add chainbase-labs/agentkey`). Codex plugins have no `userConfig`/header-interpolation mechanism, so auth uses MCP OAuth instead: the server's `/v1/mcp` endpoint advertises `WWW-Authenticate: Bearer resource_metadata=…` (RFC 9728) and supports dynamic client registration, so `.codex-plugin/mcp.json` needs only `type` + `url` — discovery does the rest. In that mode the OAuth sign-in substitutes for step 2.

It also works as a **Kimi Code plugin** (`.kimi-plugin/plugin.json`). Kimi requires `mcpServers` to be an inline object in the manifest. The remote AgentKey endpoint uses Kimi's native MCP OAuth flow; after install Kimi shows the standard `/reload` hint, then the user signs in with `/mcp-config login plugin-agentkey:agentkey` when Kimi reports that OAuth is required.

## Directory Structure

```
agentkey/
├── .claude-plugin/plugin.json   # Claude Code plugin manifest
├── .codex-plugin/
│   ├── plugin.json              # Codex plugin manifest (skills + mcpServers + interface metadata)
│   └── mcp.json                 # Codex MCP entry — http + oauth_resource (NOT the root .mcp.json)
├── .kimi-plugin/
│   └── plugin.json              # Kimi Code manifest with inline HTTP MCP entry (OAuth)
├── .agents/plugins/marketplace.json  # Codex marketplace listing this repo as a local-source plugin
├── .mcp.json                    # Auto-registers AgentKey MCP when installed as a Claude Code plugin
├── skills/agentkey/
│   ├── SKILL.md                 # Decision tree + routing rules (end-user facing)
│   ├── scripts/                 # check-update helper
│   └── version.txt              # Managed by release-please only — must live inside the skill so it survives `npx skills add`
└── scripts/
    └── uninstall.sh             # End-user cleanup helper
```

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

Releases are driven by [release-please](https://github.com/googleapis/release-please): merged PRs with Conventional Commit messages (`feat:`, `fix:`, `feat!:`, etc.) update an open Release PR that bumps `skills/agentkey/version.txt`, all three plugin manifest versions, and `CHANGELOG.md`. Merging the Release PR tags the release and creates the GitHub Release, which in turn triggers plugin updates for users.

## Version & Release Rules

- `skills/agentkey/version.txt`, the versions in `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, and `.kimi-plugin/plugin.json`, plus `CHANGELOG.md`, are managed by release-please based on Conventional Commits — never edit manually except via PR that intentionally amends them.
- `version.txt` lives inside `skills/agentkey/` (not at repo root) so it travels with the skill when the Skills CLI copies the subdirectory. `release-please-config.json` points at this path via `version-file`.
- Tag format: `v` prefix (e.g. `v0.4.5`)
- Plugin updates trigger on **GitHub Release** publication, not on plain commits
- `npx skills update` pulls from the default branch, so main must always be shippable

## Change Checklists

**Changes to any `plugin.json`:**
- release-please automatically bumps all three manifest versions + `CHANGELOG.md` from merged conventional-commit PRs; maintainers review + merge the generated Release PR rather than editing these files directly

**Changes to `.mcp.json`:**
- The MCP server is `type: http` (remote endpoint, no subprocess), so inject the API key by interpolating the userConfig value as `${user_config.AGENTKEY_API_KEY}` in the `Authorization` header — the key name MUST match the `plugin.json` `userConfig` key. Do NOT use `${CLAUDE_PLUGIN_OPTION_<KEY>}`: those env vars are only exported to stdio/subprocess servers and hook/monitor commands, and are not interpolated into an http server's headers.
- Only matters for the Claude Code plugin path; the Skills-CLI path writes MCP config through `npx @agentkey/cli --auth-login`

**Changes to `.codex-plugin/mcp.json`:**
- Codex plugin MCP config does NOT support `${user_config.*}` interpolation — a literal `${…}` would be sent as the Authorization header. Auth is MCP OAuth via RFC 9728 discovery: the server's 401 advertises `resource_metadata`, and the rmcp client automatically appends `resource=<server url>` to the authorization request.
- Do NOT set `oauth_resource`: rmcp already sends `resource` on its own, and Codex appends `oauth_resource` as a *second* `resource` query param without deduplication (`codex-rs/rmcp-client/src/perform_oauth_login.rs`). Clerk enforces RFC 6749 (no repeated params) and rejects the request with `invalid_request: The request includes the parameter 'resource' more than once`. The official Notion/Figma plugins get away with it only because their authorization servers tolerate duplicates.
- Keep the endpoint URL in sync with the root `.mcp.json` — both must point at the same `/v1/mcp` endpoint.

**Changes to `.kimi-plugin/plugin.json`:**
- `mcpServers` MUST be an inline object. Kimi does not accept a path such as `"./mcp.json"` for this field.
- Keep the HTTP entry minimal: `{"agentkey":{"url":"https://api.agentkey.app/v1/mcp"}}`. Kimi infers the transport from `url`.
- Do not add `userConfig`, a static Authorization header, or `${user_config.*}` interpolation. Kimi discovers and persists MCP OAuth credentials itself.
- Kimi displays `Run /new or /reload to apply plugin changes.` after install. Once reloaded, the user completes native MCP OAuth with `/mcp-config login plugin-agentkey:agentkey` when Kimi reports that authentication is required.
- Keep the endpoint URL in sync with the root `.mcp.json` and `.codex-plugin/mcp.json`.

**Changes to install/uninstall docs:**
- Update both `README.md` and `docs/README_zh.md` together — they mirror each other
- The canonical install is always the two-command sequence (`npx skills add …` + `npx -y @agentkey/cli --auth-login`). Don't imply either command does both.
- Do **not** re-add OpenClaw / per-agent installers without a new design — historical context is in git history (removed in chore/remove-archive-directory)

## Architecture Constraints

- Setup mode in SKILL.md runs `! npx -y @agentkey/cli --auth-login` to authenticate via browser — same command as step 2 of the public install
- `@agentkey/cli --auth-login` auto-writes MCP configs for 16 agents (canonical list lives in `AGENT_REGISTRY` in `../AgentKey-Server/cli/src/lib/mcp-clients.ts`): Claude Code, Claude Desktop, Cursor, Codex, Gemini CLI, OpenCode, Qwen Code, iFlow CLI, Kimi CLI, Kiro CLI, Windsurf, Warp, Amp, Crush, droid, openclaw. The `--only <ids>` flag (used by install.sh's `MCP_TARGETS` and install.ps1's `$McpTargets`) filters this list — its id values MUST match `npx skills add -a` ids, with `claude-desktop` as the one documented MCP-only exception. Goose / kode / kilo still need a manual JSON paste (see SKILL.md's "Fallback" section); when adding more agents server-side, keep `MCP_AUTO_AGENTS` in both install scripts and the cleanup list in both uninstall scripts in sync.
- `.mcp.json` registers the remote-HTTP MCP endpoint (`https://api.agentkey.app/v1/mcp`) in Claude Code plugin mode; the API key flows from plugin userConfig into the `Authorization: Bearer ${user_config.AGENTKEY_API_KEY}` header (no stdio binary is launched)
- `.kimi-plugin/plugin.json` registers the same endpoint inline in Kimi Code plugin mode. After reloading, the user starts Kimi's native MCP OAuth flow with `/mcp-config login plugin-agentkey:agentkey`.
- `README.md` / `docs/README_zh.md` are the public-facing docs; keep them in sync with any structural changes
