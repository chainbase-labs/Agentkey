# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

AgentKey Skill ships the agent-side half of AgentKey: a single skill that teaches Claude (and any Skills-CLI-compatible agent) how to call the AgentKey MCP tools correctly.

AgentKey has **two pieces** and a full end-user install is two commands:

1. `npx skills add chainbase-labs/agentkey` — installs **this** skill. It does NOT register the MCP server.
2. `npx -y @agentkey/cli --auth-login` — runs the AgentKey CLI (`@agentkey/cli` from `../AgentKey-Server/cli`). It mints an API key via device-code login and writes a remote-HTTP MCP block (pointing at `https://api.agentkey.app/v1/mcp`) into Claude Code, Claude Desktop, and Cursor configs. The hosted MCP server itself lives at `/v1/mcp` on AgentKey-Server.

The skill is useless without the MCP server; the MCP server works without the skill but the agent won't know to prefer it over built-in web search. Keep this mental model when editing docs — do not let either command drift into claiming it does both.

The same repo also works as a Claude Code plugin (via `.claude-plugin/plugin.json` + `.mcp.json`) for users on the plugin marketplace path; the remote HTTP entry has no static authentication header, so Claude Code follows the server's 401/RFC 9728 metadata into its native MCP OAuth flow. That OAuth sign-in substitutes for step 2.

It additionally works as a **Codex plugin** (via `.codex-plugin/plugin.json` + `.codex-plugin/mcp.json`, distributed through `.agents/plugins/marketplace.json` — the repo is its own marketplace, added with `codex plugin marketplace add chainbase-labs/agentkey`). Codex plugins have no `userConfig`/header-interpolation mechanism, so auth uses MCP OAuth instead: the server's `/v1/mcp` endpoint advertises `WWW-Authenticate: Bearer resource_metadata=…` (RFC 9728) and supports dynamic client registration, so `.codex-plugin/mcp.json` needs only `type` + `url` — discovery does the rest. In that mode the OAuth sign-in substitutes for step 2.

It also works as a **Cursor plugin** (`.cursor-plugin/plugin.json`). The Cursor-native manifest bundles `skills/` and an inline remote-HTTP MCP entry. Cursor authenticates through the server's MCP OAuth discovery, substituting for step 2.

It also works as a **Kimi Code plugin** (`.kimi-plugin/plugin.json`). Kimi requires `mcpServers` to be an inline object in the manifest. The remote AgentKey endpoint uses Kimi's native MCP OAuth flow; after install Kimi shows the standard `/reload` hint, then the user signs in with `/mcp-config login plugin-agentkey:agentkey` when Kimi reports that OAuth is required.

It also works as a **Gemini CLI extension** (root `gemini-extension.json` + `skills/`). Gemini requires the manifest at the extension root, discovers bundled agent skills automatically, and connects to AgentKey with `httpUrl` plus native MCP OAuth discovery. `oauth.enabled` requests the browser flow automatically; `/mcp auth agentkey` is the manual fallback. Either substitutes for step 2.

It also works as an **Antigravity 2.0 and Antigravity CLI plugin** (root `plugin.json` + `mcp_config.json` + `skills/`). Both runtimes use the same package, require `serverUrl` for remote MCP, and authenticate through automatic OAuth discovery.

It also has a **CLI-managed DeepSeek Harness integration**. The installers detect `${DSH_HOME:-~/.dsh}` / `dsh`, install the skill globally (never `skills add -a dsh`), and let `@agentkey/cli --auth-login --only dsh` maintain one marked `@deepseek-ai/dsh-mcp-client` entry in `$DSH_HOME/cordis.patch.yml`. DSH composes that home layer over current and future profiles; running processes watch it through HMR. DSH rc.7 has no MCP OAuth `authProvider`, so this path requires the CLI-written Bearer key. Tool policy may still hide tools.

## Directory Structure

```
agentkey/
├── .claude-plugin/plugin.json   # Claude Code plugin manifest
├── .codex-plugin/
│   ├── plugin.json              # Codex plugin manifest (skills + mcpServers + interface metadata)
│   └── mcp.json                 # Codex MCP entry — http + oauth_resource (NOT the root .mcp.json)
├── .cursor-plugin/
│   └── plugin.json              # Cursor manifest with skills + inline HTTP MCP entry (OAuth)
├── .kimi-plugin/
│   └── plugin.json              # Kimi Code manifest with inline HTTP MCP entry (OAuth)
├── .agents/plugins/marketplace.json  # Codex marketplace listing this repo as a local-source plugin
├── .mcp.json                    # Claude MCP entry — HTTP + OAuth discovery, no static headers
├── gemini-extension.json        # Gemini CLI extension — Streamable HTTP + OAuth discovery
├── plugin.json                  # Antigravity desktop/CLI plugin marker
├── mcp_config.json              # Antigravity remote MCP entry — serverUrl + OAuth discovery
├── skills/agentkey/
│   ├── SKILL.md                 # Decision tree + routing rules (end-user facing)
│   ├── scripts/                 # check-update helper
│   └── version.txt              # Managed by release-please only — must live inside the skill so it survives `npx skills add`
└── scripts/
    ├── build-release-assets.sh  # Builds Skill + Gemini GitHub Release assets
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

Releases are driven by [release-please](https://github.com/googleapis/release-please): merged PRs with Conventional Commit messages (`feat:`, `fix:`, `feat!:`, etc.) update an open Release PR that bumps `skills/agentkey/version.txt`, all four versioned plugin manifest versions, `gemini-extension.json`, and `CHANGELOG.md`. The Antigravity manifest has no version field. Merging the Release PR tags the release and creates the GitHub Release, which in turn triggers plugin updates for users.

## Version & Release Rules

- `skills/agentkey/version.txt`, the versions in `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `.kimi-plugin/plugin.json`, and `gemini-extension.json`, plus `CHANGELOG.md`, are managed by release-please based on Conventional Commits — never edit manually except via PR that intentionally amends them.
- `version.txt` lives inside `skills/agentkey/` (not at repo root) so it travels with the skill when the Skills CLI copies the subdirectory. `release-please-config.json` points at this path via `version-file`.
- Tag format: `v` prefix (e.g. `v0.4.5`)
- Plugin updates trigger on **GitHub Release** publication, not on plain commits
- `npx skills update` pulls from the default branch, so main must always be shippable

## Change Checklists

**Changes to any `plugin.json`:**
- release-please automatically bumps all four manifest versions + `CHANGELOG.md` from merged conventional-commit PRs; maintainers review + merge the generated Release PR rather than editing these files directly

**Changes to `.mcp.json`:**
- Keep the remote server as the minimal `type: http` + `url` entry. Do not add `headers`, `headersHelper`, `userConfig`, a static token, or an API-key placeholder.
- Claude Code treats any configured `Authorization` header as explicit header authentication and does not fall back to OAuth when that header receives a 401. With no header, the server's 401 and RFC 9728 protected-resource metadata expose the native **Authenticate** action and `claude mcp login plugin:agentkey:agentkey` flow.
- This applies only to the Claude Code plugin path; the Skills-CLI path still writes API-key MCP config through `npx @agentkey/cli --auth-login`.

**Changes to `.codex-plugin/mcp.json`:**
- Codex plugin MCP config does NOT support `${user_config.*}` interpolation — a literal `${…}` would be sent as the Authorization header. Auth is MCP OAuth via RFC 9728 discovery: the server's 401 advertises `resource_metadata`, and the rmcp client automatically appends `resource=<server url>` to the authorization request.
- Do NOT set `oauth_resource`: rmcp already sends `resource` on its own, and Codex appends `oauth_resource` as a *second* `resource` query param without deduplication (`codex-rs/rmcp-client/src/perform_oauth_login.rs`). Clerk enforces RFC 6749 (no repeated params) and rejects the request with `invalid_request: The request includes the parameter 'resource' more than once`. The official Notion/Figma plugins get away with it only because their authorization servers tolerate duplicates.
- Keep each plugin endpoint aligned with the Server routing contract. Kimi uses the attributed `/kimi/v1/mcp` alias; the other plugin manifests currently use `/v1/mcp`. Do not require every client path to be byte-identical.

**Changes to `.cursor-plugin/plugin.json`:**
- The manifest MUST stay at `.cursor-plugin/plugin.json`; component paths resolve from the plugin root.
- Use only fields documented by the Cursor plugin reference. Do not copy Codex/Kimi-only metadata such as `interface` into this manifest.
- Keep `skills` pointed at `./skills/` and `mcpServers` as the minimal inline `{"agentkey":{"url":"https://api.agentkey.app/v1/mcp"}}` entry. Do not add static credentials or `${user_config.*}` interpolation; Cursor handles MCP OAuth itself.
- Keep the Cursor endpoint at `/v1/mcp` until the Server routing contract assigns it a client-specific path.
- This repository is a single Cursor plugin, so `.cursor-plugin/marketplace.json` is not required. Submit the public repository URL through Cursor's marketplace publisher.

**Changes to `.kimi-plugin/plugin.json`:**
- `mcpServers` MUST be an inline object. Kimi does not accept a path such as `"./mcp.json"` for this field.
- Keep the HTTP entry minimal: `{"agentkey":{"url":"https://api.agentkey.app/kimi/v1/mcp"}}`. Kimi infers the transport from `url`; the path preserves Kimi attribution while reaching the same MCP surface.
- Do not add `userConfig`, a static Authorization header, or `${user_config.*}` interpolation. Kimi discovers and persists MCP OAuth credentials itself.
- Kimi displays `Run /new or /reload to apply plugin changes.` after install. Once reloaded, the user completes native MCP OAuth with `/mcp-config login plugin-agentkey:agentkey` when Kimi reports that authentication is required.
- Keep the Kimi endpoint aligned with the Server's `/kimi/v1/mcp` attributed alias.

**Changes to `gemini-extension.json`:**
- The manifest MUST remain at the repository root because Gemini installs the repository as the extension root and expects the extension name to match its install directory.
- Keep `mcpServers.agentkey` inline and use `httpUrl` for the Streamable HTTP endpoint. Do not use the SSE-only `url` field for `/v1/mcp`.
- Keep `oauth` limited to `{"enabled":true}` so Gemini starts its native browser flow after the server's 401 while still discovering all endpoints dynamically. Do not add static credentials, OAuth endpoints/client credentials, `settings`, custom headers, or `trust`. `/mcp auth agentkey` remains the manual fallback.
- Do not duplicate `skills/agentkey/` or add an always-loaded `GEMINI.md`; Gemini discovers the existing skill automatically.
- Keep the Gemini endpoint at `/v1/mcp` until the Server routing contract assigns it a client-specific path.

**Changes to GitHub Release assets:**
- Keep `agentkey.skill` for Skill consumers, but never publish it as the only generic Release asset. Gemini CLI treats a lone generic asset as an extension archive and only extracts `.tar.gz` or `.zip` files.
- Run `scripts/build-release-assets.sh` to produce `agentkey.skill` plus `darwin.agentkey.tar.gz`, `linux.agentkey.tar.gz`, and `win32.agentkey.zip`.
- Every platform-named Gemini archive MUST contain `gemini-extension.json` and `skills/agentkey/SKILL.md` at its archive root. Keep the platform prefixes so Gemini selects these archives before `agentkey.skill`.

**Changes to root `plugin.json` / `mcp_config.json`:**
- Keep both files at the repository root so Antigravity 2.0 and Antigravity CLI share one plugin package and reuse `skills/agentkey/` without duplication.
- Keep `plugin.json` limited to the documented `$schema`, `name`, and `description` fields. The Antigravity schema has no `version` field, so release-please must not add one.
- Keep `mcpServers.agentkey` inline in `mcp_config.json` and use `serverUrl`; legacy `url` and `httpUrl` fields are unsupported.
- Do not add static credentials, headers, or manual OAuth client secrets. AgentKey supports dynamic client registration, so Antigravity performs automatic OAuth discovery.
- Keep the Antigravity endpoint at `/v1/mcp` until the Server routing contract assigns it a client-specific path.

**Changes to install/uninstall docs:**
- Update both `README.md` and `docs/README_zh.md` together — they mirror each other
- The canonical install is always the two-command sequence (`npx skills add …` + `npx -y @agentkey/cli --auth-login`). Don't imply either command does both.
- Do **not** re-add OpenClaw / per-agent installers without a new design — historical context is in git history (removed in chore/remove-archive-directory)
- Describe DSH as a CLI-managed MCP integration, not a native installable DSH plugin. Do not reintroduce the removed README-only `.dsh-plugin/agentkey/` placeholder without a real package and install contract.
- Never commit a real DSH Authorization key. Tests and examples use obviously fake values; production keys live only in the user's local `cordis.patch.yml`.

## Architecture Constraints

- Setup mode in SKILL.md runs `! npx -y @agentkey/cli --auth-login` to authenticate via browser — same command as step 2 of the public install
- `@agentkey/cli --auth-login` auto-writes MCP configs for 18 agents (canonical list lives in `AGENT_REGISTRY` in `../AgentKey-Server/cli/src/lib/mcp-clients.ts`), including Hermes and DeepSeek Harness. The `--only <ids>` flag filters this list. Most ids match `npx skills add -a`; `claude-desktop` has no skill path, `hermes` is a local CLI exception, and `dsh` deliberately uses only the global `skills add -g` path. Goose / kode / kilo still need manual MCP setup. Keep the Bash/PowerShell installer target subsets and uninstall cleanup behavior synchronized with their intended registry entries.
- DSH automatic config is `${DSH_HOME:-~/.dsh}/cordis.patch.yml`, with exactly one `# agentkey:start` / `# agentkey:end` block in the home patch. The Loader entry id and `serverName` are both `agentkey`. Existing per-profile managed blocks are migration inputs only; recognize markers at column 1 and never inside indented YAML block scalars. Structurally detected unmarked legacy Loader rows must stop migration for manual removal, never trigger guessed text deletion. Symlinked profile patches are read-only migration inputs: allow clean ones, but stop before all writes when either legacy form is present. A profile is not required before installation. Archive a legacy `.agent-presets/agentkey` directory instead of deleting it. `Mounted` is not connection proof; readiness requires the three core MCP tools to be visible and callable in the intended tool policy.
- `.mcp.json` registers the remote-HTTP MCP endpoint (`https://api.agentkey.app/v1/mcp`) in Claude Code plugin mode with no static header or `userConfig`; Claude Code performs native MCP OAuth discovery after the server's 401 response.
- `.cursor-plugin/plugin.json` registers the same endpoint inline in Cursor plugin mode, authenticated through Cursor's native MCP OAuth flow
- `.kimi-plugin/plugin.json` registers the attributed `https://api.agentkey.app/kimi/v1/mcp` endpoint inline in Kimi Code plugin mode. After reloading, the user starts Kimi's native MCP OAuth flow with `/mcp-config login plugin-agentkey:agentkey`.
- `gemini-extension.json` registers the same endpoint through `httpUrl` in Gemini CLI extension mode. Gemini discovers the existing `skills/agentkey/` tree; `oauth.enabled` starts native OAuth automatically and `/mcp auth agentkey` retries it manually.
- Root `plugin.json` and `mcp_config.json` package the existing skill and the same endpoint for both Antigravity 2.0 and Antigravity CLI; remote MCP uses `serverUrl` and automatic OAuth discovery.
- `README.md` / `docs/README_zh.md` are the public-facing docs; keep them in sync with any structural changes
