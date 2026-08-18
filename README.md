<p align="center">
<img width="256" alt="AgentKey" src="https://github.com/user-attachments/assets/4c7c78a9-e5d8-45ce-9372-d5bffe8f61c5" />
</p>

<p align="center">
  <strong>One command. Full internet access for your AI agent.</strong>
  <br>
  Browse Twitter, search LinkedIn, scrape social media, read any webpage. Zero config. Just install and go.
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#what-your-agent-can-now-do">Platforms</a> ·
  <a href="#faq">FAQ</a> ·
  <a href="docs/README_zh.md">中文</a>
</p>

<p align="center">
  <a href="https://agentkey.app"><img src="https://img.shields.io/badge/Website-agentkey.app-blue?style=for-the-badge" alt="Website" /></a>
  <a href="https://console.agentkey.app"><img src="https://img.shields.io/badge/Console-console.agentkey.app-7c3aed?style=for-the-badge" alt="Console" /></a>
</p>

<p align="center">
  <a href="https://www.producthunt.com/products/agentkey?embed=true&amp;utm_source=badge-top-post-badge&amp;utm_medium=badge&amp;utm_campaign=badge-agentkey" target="_blank" rel="noopener noreferrer"><img alt="AgentKey - One-stop live data marketplace for your agent | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=1192591&amp;theme=light&amp;period=daily&amp;t=1784013858323"></a>
</p>

---

**Install AgentKey. Give your AI superpowers.**

AgentKey is the master key for the agent ecosystem. When using Claude, Manus, or other agents, you often need external data: social media, e-commerce, on-chain data, various APIs. That means hunting down API keys, managing subscriptions, or hitting dead ends.

With AgentKey installed, your agent gains all these data capabilities automatically. No per-provider registrations, no juggling separate API bills. One subscription and go.

> ⭐ Star this repo to get notified whenever we add new platform support or release updates.

---

## Use Cases

| You ask your agent to...                               | Without AgentKey              | With AgentKey                                  |
| ------------------------------------------------------ | ----------------------------- | ---------------------------------------------- |
| 🐦 What has Musk been saying on Twitter lately?        | Can't access, tweets blocked  | Pulls all relevant tweets and summarizes them  |
| 📕 What do people think of this product on Instagram?  | Blocked, login required       | Scrapes real posts, organizes by sentiment     |
| 📺 What does this YouTube / Bilibili video cover?      | Can't read, no subtitles      | Reads the video/transcript, extracts key points |
| 📖 Find Reddit threads about this pain point           | 403 blocked                   | Finds relevant threads and extracts solutions  |
| 👔 Check this competitor / candidate's LinkedIn        | 403, access issues            | Opens the page, summarizes key info            |
| 🎵 What's trending on Douyin / TikTok right now?       | Can't scrape the hot list     | Pulls trending topics and tags                 |
| 🌐 What does this webpage say?                         | Returns a wall of raw HTML    | Extracts the content, explains it clearly      |
| 📦 What does this GitHub repo do?                      | Have to click through yourself | Reads README & Issues, one-line summary       |
| 🧾 What has this wallet / fund been buying lately?     | Click through a block explorer | Summarizes recent transactions and positions  |

Before AgentKey: 10 tasks → 10 API keys → 10 separate bills.

Your agent is half-capable at best, constantly needing human help to find data, juggling credentials, drowning in complexity.

Now: one AgentKey handles everything. **AgentKey unifies all the external access your AI needs to do real work.**

---

## New here? Start on the web

Before touching the terminal, you can get a feel for AgentKey directly in your browser — the website and console explain things more visually than this README can.

- 🌐 **[agentkey.app](https://agentkey.app)** — Product overview, supported platforms, live demos, pricing details
- 🎛️ **[console.agentkey.app](https://console.agentkey.app)** — Sign up, manage your subscription, manage your API key, track usage

The one-line install below is what plugs AgentKey into your AI agent. If you only want to look around first, the two links above are the friendlier starting point.

---

## Install

One command. A browser tab opens for login, then you're done. The installer auto-detects every agent on your machine ([40+ supported](https://github.com/vercel-labs/skills#available-agents). Common examples include Claude Code, Codex, Gemini CLI, and Cursor CLI, etc.) and configures each one.

**macOS / Linux**
```bash
curl -fsSL https://agentkey.app/install.sh | bash
```

**Windows** (PowerShell)
```powershell
irm https://agentkey.app/install.ps1 | iex
```

Restart your agent, then ask it something that needs the internet. A running DeepSeek Harness profile watches the home patch through HMR; stopped profiles load it on their next start.

> *"What has Musk been tweeting about lately?"*

That's it. No API key to copy, no JSON to edit. 

<sub>Need to target specific agents or run in CI? → See the "Advanced install options" item in the [FAQ](#faq).</sub>

---

### DeepSeek Harness (DSH)

The one-line installers above detect `${DSH_HOME:-~/.dsh}` or the `dsh` command automatically. They install the AgentKey skill globally at `~/.agents/skills/agentkey`, authenticate with AgentKey, and add one managed Loader block to DSH's home-level patch:

```text
${DSH_HOME:-~/.dsh}/cordis.patch.yml
```

This is a **CLI-managed DSH MCP integration**, not a native installable DSH plugin. The home layer uses Loader id `agentkey`, module `@deepseek-ai/dsh-mcp-client`, and MCP `serverName: agentkey`; it is composed over current and future profiles. Tool allow/deny policy still controls whether a preset, session, or subagent can see the tools.

DSH 0.1.0-rc.7 does not provide an OAuth `authProvider` to its MCP SDK client. A header-free server entry cannot complete 401/RFC 9728 discovery or open a browser. DSH must use the device-code command below so the CLI writes a local Bearer key.

For a DSH-only manual install, run exactly these two steps:

```bash
npx skills add chainbase-labs/agentkey -g -y
npx -y @agentkey/cli --auth-login --only dsh
```

The CLI stores the real API key only in the single local home patch; no key belongs in Git. Re-running the command rotates the key and replaces the managed block. No existing profile is required. During migration it removes only top-level, column-1 AgentKey managed blocks from per-profile patches and renames a legacy `.agent-presets/agentkey` directory to a timestamped backup; the CLI prints that backup path. If it structurally detects an older unmarked AgentKey Loader row, it stops without changing any patch and asks you to remove that top-level `insert` child manually. Symlinked profile patches are inspected read-only: a clean symlink profile is allowed, while either legacy AgentKey form stops installation and reports the path for manual removal.

Only currently running profile processes observe the home-file change immediately through HMR. Stopped and future profiles load it when they start. If an old preset was already active in a session, close that session or restart DSH once after migration.

#### How to confirm DSH installation

1. Open **DSH → Settings → Plugins → Plugin list**, search for configured id `agentkey`, and expand the `mcp-client` row. DSH 0.1 currently renders:
   - Loader path: `include:agentkey` (the stable configured entry id is `agentkey`)
   - module title: `@deepseek-ai/dsh-mcp-client` (the card shortens it to `mcp-client`)
   - Cordis status: `Mounted` (the underlying fiber phase is `active`)

   `Mounted`/`active` proves only that Cordis loaded the row. Because `failOnStartupError: false`, it does **not** prove that MCP authenticated or connected.

2. In the intended preset/session, confirm the three core tools are visible:
   - `mcp__agentkey__find_tools`
   - `mcp__agentkey__describe_tool`
   - `mcp__agentkey__execute_tool`

   `list_tools` is deprecated and is not a readiness requirement. If a core tool is hidden only in one context, inspect that preset/session/subagent's tool policy.

3. Ask: **“Please use AgentKey to search for today's latest AI news.”** Success requires an actual `find_tools` → `describe_tool` → `execute_tool` call, not merely a Mounted card.

Troubleshooting:

- **No `agentkey` row:** the home patch was not written or `DSH_HOME` points elsewhere. Re-run the DSH-only CLI command and inspect its reported path.
- **Row exists but is not Mounted/active:** inspect the Loader error and verify `@deepseek-ai/dsh-mcp-client` exists in the DSH installation.
- **Mounted but tools are missing:** inspect MCP connection logs, the local Authorization key, and the active tool policy. In `tools/list`, each tool's root `inputSchema.additionalProperties` must be absent or `true`, never `false`.
- **401:** the local key is missing or invalid; rerun auth-login to rotate it.
- **`serverName already in use`:** rerun the current CLI so it archives the legacy preset, then close sessions that still hold the old preset or restart DSH once.

---

## What your agent can now do

AgentKey maintains cloud-side integrations across the open web — no extra accounts, no extra keys.

| Capability | What it covers |
| :--- | :--- |
| **Web search** | Search engines, news, and real-time discovery across the open web |
| **Web scraping** | Clean article extraction, structured data, and metadata from any URL |
| **On-chain / Crypto** | Token prices, market data, on-chain activity, and project metadata |
| **Social & content** | Public posts, videos, and discussions across major social and content platforms |
| **Finance** | Stock & FX quotes, technical indicators, company financials, and earnings |
| **E-commerce** | Product listings, prices, reviews, and best-sellers across major marketplaces |
| **Business** | Company, funding, investor, and people data for market and competitive research |

Underlying providers are routed automatically and grow over time — your agent can call `find_tools` to see what's currently available.

**Planned:** Maps & Weather

---

## FAQ

<details>
<summary><b>Is it safe?</b></summary>

Yes. AgentKey is a master key — one platform that unlocks external capabilities for your agent. By design, we have no access to your local files, your credentials, or your agent's conversations. The only data AgentKey collects is anonymous usage telemetry — which agent you installed into, your skill version, and upgrade outcomes — never your queries or responses. See "How do I opt out of telemetry?" below.

</details>

<details>
<summary><b>How is this different from Claude / ChatGPT's built-in web access?</b></summary>

Native web access in Claude and ChatGPT has limited platform coverage. It often can't reach Twitter, on-chain data, etc. AgentKey fills those gaps.

</details>

<details>
<summary><b>How does pricing work? What if I use up my plan's credits?</b></summary>

AgentKey is subscription-based. Each plan includes a monthly credit allowance; usage beyond that is billed pay-as-you-go as overage. You can upgrade your plan or manage billing anytime at [console.agentkey.app](https://console.agentkey.app). See [agentkey.app](https://agentkey.app) for current plans and pricing.

</details>

<details>
<summary><b>How do I update?</b></summary>

There are two pieces and they update differently:

- **MCP server**: the real server is hosted at `https://api.agentkey.app/v1/mcp`, so it's always up to date — no local upgrade step. The `@agentkey/cli` package (run as `npx -y @agentkey/cli --auth-login`) only writes the remote-HTTP MCP config into each AI client and never has to be re-run unless you want to rotate your key.

- **Skill files** (`SKILL.md` + helpers): how this updates depends on your client.

### Claude Code

Updates are automatic. On the first call of a session the skill runs a silent version check; if a new release is available it prompts you to upgrade and (with your consent) runs `npx skills update -g agentkey`.

### Claude Desktop, Cursor, and other clients without an inline Bash tool

The skill cannot run the inline check itself, but starting in v1.4.0 the **MCP server publishes the latest skill version via a dedicated metadata tool (`agentkey_skill_meta`)**. Your agent calls it once per session, compares against this skill's own version, and prompts you to upgrade with the exact command for your client. See [protocol/skill-meta-v1.md](./protocol/skill-meta-v1.md) for the protocol details.

**One-time bootstrap on Desktop:** if you're stuck on a pre-1.4.0 skill in Claude Desktop, the metadata tool exists but your skill rule doesn't know how to read it. Bring yourself current once with:

```bash
# Replace <UUID1>/<UUID2> with the actual session folder under skills-plugin
# (usually there's just one; pick the one that contains skills/agentkey/SKILL.md)
DESKTOP_BASE="$HOME/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin"
LATEST_REPO_ZIP=$(mktemp -d)/agentkey.tar.gz
curl -fsSL https://github.com/chainbase-labs/agentkey/archive/refs/heads/main.tar.gz -o "$LATEST_REPO_ZIP"
tar -xzf "$LATEST_REPO_ZIP" -C "$(dirname "$LATEST_REPO_ZIP")"
find "$DESKTOP_BASE" -type d -path "*/skills/agentkey" 2>/dev/null | while read -r dst; do
  cp -R "$(dirname "$LATEST_REPO_ZIP")"/agentkey-main/skills/agentkey/. "$dst/"
done
# Then fully quit and restart Claude Desktop.
```

After this one bootstrap, future versions will be discovered automatically via the metadata tool.

### Force manual update (any client)

```bash
# Refresh the skill content
npx skills update agentkey

# Pin a specific version
npx skills add chainbase-labs/agentkey@v1.0.0
```

Note: `npx skills update` writes to `~/.agents/skills/agentkey` and `~/.claude/skills/agentkey`, which is where Claude Code reads from. **Claude Desktop reads from its own sandbox path** and is not touched by `npx skills update` — use the Desktop bootstrap command above for Desktop.

Re-run `npx -y @agentkey/cli --auth-login` only when you want to rotate your API key.

</details>

<details>
<summary><b>How do I uninstall?</b></summary>

One command, cleans every agent and config file.

**macOS / Linux**
```bash
curl -fsSL https://agentkey.app/uninstall.sh | bash
```

**Windows** (PowerShell)
```powershell
irm https://agentkey.app/uninstall.ps1 | iex
```

Removes the skill from every agent, strips the `agentkey` MCP entry + API key from all MCP client configs, and clears caches/logs. Pass `--keep-marketplace` (bash) / `-KeepMarketplace` (PowerShell) to retain the Claude Code plugin marketplace entry.

**Prefer manual two-step?**

```bash
# 1. Remove the skill from every agent
npx skills remove chainbase-labs/agentkey

# 2. Delete the "agentkey" entry under mcpServers in each MCP client config:
#    - Claude Code:     ~/.claude.json
#    - Claude Desktop:  ~/Library/Application Support/Claude/claude_desktop_config.json  (macOS)
#                       %APPDATA%\Claude\claude_desktop_config.json                      (Windows)
#    - Cursor:          ~/.cursor/mcp.json
```

The one-command uninstaller additionally cleans npm/npx caches, legacy shell rc entries, CLAUDE.md sections, and MCP stdio logs — use that if you want a fully clean slate.

</details>

<details>
<summary><b>How do I opt out of telemetry?</b></summary>

AgentKey sends anonymous usage telemetry (which agent you use, skill version, upgrade outcomes — never queries or responses). Three ways to opt out, any of them works:

```bash
# Persistent opt-out (recommended)
touch ~/.config/agentkey/telemetry-disabled

# One-shot env override (CI / single session)
AGENTKEY_TELEMETRY=0 <your command>

# At install time
curl -fsSL https://agentkey.app/install.sh | bash -s -- --no-telemetry
```

To re-enable, delete `~/.config/agentkey/telemetry-disabled`.

</details>

<details>
<summary><b>Something's not working — how do I check?</b></summary>

Inside your agent, try `/agentkey status` — it diagnoses your MCP config, version, and connectivity.

Available slash commands:

| Command | What it does |
|---------|--------------|
| `/agentkey` | Auto-triggered during data queries — you usually don't call it manually |
| `/agentkey setup` | First-time setup: configure API key + verify MCP connectivity |
| `/agentkey status` | Diagnose current config (MCP, version, connectivity test) |

Still stuck? See the "Where do I get help" item below.

</details>

<details>
<summary><b>Advanced install options (CI / specific agents / manual two-step)</b></summary>

The installer auto-detects which AI agents you have on this machine (by probing well-known config dirs and binaries from the [vercel-labs/skills supported-agents list](https://github.com/vercel-labs/skills)) and pre-selects them — no multi-select prompt. Override with the flags below.

**Installer flags:**

```bash
# Non-interactive (CI / unattended): install to every detected agent, no prompts
curl -fsSL https://agentkey.app/install.sh | bash -s -- --yes

# See which agents the installer would auto-select on this host (and exit)
curl -fsSL https://agentkey.app/install.sh | bash -s -- --list-agents

# Only install the skill for specific agents (overrides auto-detection)
curl -fsSL https://agentkey.app/install.sh | bash -s -- --only claude-code,cursor

# Skip our agent detection; let `skills` CLI install for every agent it finds
curl -fsSL https://agentkey.app/install.sh | bash -s -- --all-agents

# Only the skill, or only the MCP auth
curl -fsSL https://agentkey.app/install.sh | bash -s -- --skip-mcp
curl -fsSL https://agentkey.app/install.sh | bash -s -- --skip-skill
```

PowerShell equivalents: `-Yes`, `-ListAgents`, `-Only`, `-AllAgents`, `-SkipMcp`, `-SkipSkill`.

**Manual two-step install** (if you'd rather run the two underlying commands yourself, or the one-line installer can't reach your machine):

```bash
# 1. Install the skill into every detected agent
npx skills add chainbase-labs/agentkey

# 2. Authenticate and register the MCP server
npx -y @agentkey/cli --auth-login
```

**Headless / SSH / Docker?** The auth step always tries to open a browser **and** prints the URL — so on a machine without a usable display, just copy the printed URL to any device with a browser to finish auth. Prefer typing the key manually? `npx -y @agentkey/cli --setup` opens an interactive wizard instead.

</details>

<details>
<summary><b>My agent isn't on the auto-configured list — how do I set it up manually?</b></summary>

The CLI supports the clients shown in its current **Supported agents** list, and the one-line installer targets the supported clients it detects — including **DeepSeek Harness**. If your client is not detected or supported for automatic configuration, the skill can still be installed globally, but you must paste this MCP snippet into that client's own config (path varies per client):

```json
{
  "mcpServers": {
    "agentkey": {
      "type": "http",
      "url": "https://api.agentkey.app/v1/mcp",
      "headers": { "Authorization": "Bearer ak_..." }
    }
  }
}
```

Then restart the agent. The skill's first-run activation will also walk you through this.

</details>

<details>
<summary><b>Can I self-host or develop against this?</b></summary>

**Install from a local checkout:**

```bash
git clone https://github.com/chainbase-labs/agentkey.git
cd agentkey

# 1. Install your working tree into every detected agent
npx skills add .

# 2. Register the MCP server (if you haven't already)
npx -y @agentkey/cli --auth-login
```

`npx skills add .` accepts a local path (or a `file://` URL) — run it again after each edit to `skills/agentkey/SKILL.md`. The MCP step only needs to run once per machine.

**Iterating on the MCP server itself?** The server lives at `AgentKey-Server/` (Go) and exposes the MCP endpoint at `/v1/mcp`. Run a local server (`make run`) and point your MCP config at `http://localhost:8081/v1/mcp` to test changes end-to-end.

**Claude Code plugin mode** — install straight from the marketplace. The plugin bundles a header-free remote HTTP entry and uses Claude Code's native MCP OAuth flow, so there is **no API key to paste and no second `@agentkey/cli` step**:

```bash
# Public install
claude plugin marketplace add chainbase-labs/agentkey
claude plugin install agentkey@agentkey

# …or from a local checkout, for development
claude plugin marketplace add /absolute/path/to/agentkey
claude plugin install agentkey@agentkey
```

After installation, run `/reload-plugins`, open `/mcp`, select the AgentKey entry, and choose **Authenticate** to complete browser sign-in. From a terminal, `claude mcp login plugin:agentkey:agentkey` starts the same OAuth flow. The plugin's `.mcp.json` intentionally has no `Authorization` header: adding one makes Claude Code treat the server as header-authenticated and suppresses OAuth fallback after a 401. Reload a local checkout with `claude plugin update agentkey` after edits. Day-to-day Skill iteration is still fastest via the Skills CLI path; the plugin path is the OAuth-based option for Claude Code users.

**Codex plugin mode** — install from the marketplace bundled in this repo. Auth is OAuth (browser sign-in on install), so there's **no API key to paste and no second `@agentkey/cli` step**:

```bash
# Public install
codex plugin marketplace add chainbase-labs/agentkey
# then run /plugins inside Codex and install AgentKey,
# or: codex plugin install agentkey@agentkey
```

The plugin manifest lives in `.codex-plugin/plugin.json`; it bundles the same skill plus a remote-HTTP MCP entry (`.codex-plugin/mcp.json`) that authenticates against `https://api.agentkey.app/v1/mcp` via MCP OAuth (RFC 9728 discovery). Sign in with your AgentKey account when Codex prompts you.

**Kimi Code plugin mode** — install the repo directly from Kimi Code. The manifest bundles the skill and an inline remote-HTTP MCP entry, so there is **no API key to paste and no second `@agentkey/cli` step**:

```text
# Public install
/plugins install https://github.com/chainbase-labs/agentkey

# Or install a local checkout for development
/plugins install /absolute/path/to/agentkey
```

Kimi shows `Run /new or /reload to apply plugin changes.` after installation. Run `/reload`; when Kimi reports that the plugin MCP server needs OAuth, run `/mcp-config login plugin-agentkey:agentkey` and approve the browser authorization. You can then ask your original AgentKey question.

Kimi copies local plugins into its managed plugin directory. Re-run `/plugins install /absolute/path/to/agentkey` after editing the checkout, then run `/reload` again.

If you previously worked around an older AgentKey plugin by adding a user-global `agentkey` entry through `/mcp-config`, remove that old entry once with `/mcp-config remove agentkey` before reloading. The plugin now owns its namespaced MCP entry; keeping both would create duplicate tools and authentication attempts.

**Cursor plugin mode** — install AgentKey from the Cursor Marketplace after the listing is published. The Cursor-native manifest at `.cursor-plugin/plugin.json` bundles the same Skill and an inline remote-HTTP MCP entry, so there is **no API key to paste and no second `@agentkey/cli` step**. When Cursor prompts for MCP authentication, approve the AgentKey browser sign-in.

For maintainers, push the plugin to a public Git repository and submit the repository URL at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish). Before submitting, test the plugin in the current Cursor release and confirm that both the `agentkey` Skill and MCP server load successfully after OAuth. The manifest follows the [Cursor plugin reference](https://cursor.com/docs/reference/plugins); keep its component paths relative to the plugin root.

**Gemini CLI extension mode** — install the repository as an extension. The root `gemini-extension.json` bundles the existing AgentKey skill and the remote Streamable HTTP MCP server, so there is **no API key to paste and no second `@agentkey/cli` step**:

```bash
# Public install
gemini extensions install https://github.com/chainbase-labs/agentkey

# Or link a local checkout for development
gemini extensions link /absolute/path/to/agentkey
```

Restart Gemini CLI after installing or linking. On the first connection, the extension's `oauth.enabled` setting asks Gemini to start its native browser authorization automatically. Complete that flow, then run `/mcp reload` and `/mcp list` to confirm that `agentkey` is connected. If Gemini only reports that authentication is required, or the browser flow was closed, run `/mcp auth agentkey` to start it manually. Gemini stores and refreshes the OAuth tokens, so this is normally a one-time sign-in. Do not add a second user-level MCP entry or run `@agentkey/cli --auth-login` in extension mode.

If Gemini reports that `~/.agents/skills/agentkey` overrides the copy bundled by the extension, that is a separate Skill-precedence warning rather than an OAuth failure. A previously installed user Skill has higher priority and can safely remain when it is the same version—especially if other agents use that shared directory. Remove it with `gemini skills uninstall agentkey --scope user` only when it is no longer needed elsewhere, then run `/skills reload`.

**Antigravity 2.0 / Antigravity CLI plugin mode** — both runtimes use the root `plugin.json`, `mcp_config.json`, and existing `skills/` directory. The MCP entry uses Antigravity's `serverUrl` schema and automatic OAuth discovery through dynamic client registration, so there is **no API key to paste, no OAuth client secret to configure, and no second `@agentkey/cli` step**.

For Antigravity 2.0, place the repository at workspace scope or global scope, then restart Antigravity:

```bash
# Workspace scope
git clone https://github.com/chainbase-labs/agentkey.git /path/to/workspace/.agents/plugins/agentkey

# Or global scope
git clone https://github.com/chainbase-labs/agentkey.git ~/.gemini/config/plugins/agentkey
```

For Antigravity CLI, install a local checkout and verify it is registered:

```bash
agy plugin install /absolute/path/to/agentkey
agy plugin list
```

After Antigravity discovers the plugin, authenticate its bundled MCP entry rather than adding a duplicate:

- **Antigravity 2.0:** open **Settings → Customizations → Installed MCP Servers**, click **Authenticate** next to AgentKey, complete the browser flow, copy the authorization code back into the settings panel, and submit it. The server reconnects automatically; click **Refresh** if the status does not update.
- **Antigravity CLI:** open `/mcp`, select `agentkey`, choose **Authenticate**, and follow the browser/code prompts. Reload the server in the same panel and confirm the AgentKey tools are listed; inspect its connection logs there if it remains disconnected.

Keep `mcp_config.json` free of static headers, access tokens, and OAuth client credentials. AgentKey publishes protected-resource and authorization-server metadata, including a dynamic registration endpoint, for both Antigravity runtimes to discover.

**Repo layout:**

```
agentkey/
├── .claude-plugin/plugin.json   # Claude Code plugin manifest
├── .codex-plugin/
│   ├── plugin.json              # Codex plugin manifest
│   └── mcp.json                 # Codex MCP entry (OAuth, no user_config)
├── .cursor-plugin/
│   └── plugin.json              # Cursor manifest with Skill + inline MCP OAuth
├── .kimi-plugin/
│   └── plugin.json              # Kimi manifest with inline MCP OAuth entry
├── .agents/plugins/marketplace.json  # Codex marketplace (this repo is its own marketplace)
├── .mcp.json                    # Claude plugin MCP entry (OAuth discovery, no headers)
├── gemini-extension.json        # Gemini CLI extension manifest (MCP OAuth + skills)
├── plugin.json                  # Antigravity desktop/CLI plugin manifest
├── mcp_config.json              # Antigravity remote MCP entry (serverUrl + OAuth)
├── skills/agentkey/
│   ├── SKILL.md                 # Decision tree + routing rules
│   ├── scripts/                 # check-update helper
│   └── version.txt              # Managed by release-please
└── scripts/
    ├── build-release-assets.sh  # Build Skill + Gemini GitHub Release assets
    ├── install.sh               # One-command installer (mac/linux)
    ├── install.ps1              # Windows PowerShell installer
    ├── uninstall.sh             # One-command uninstaller (mac/linux)
    └── uninstall.ps1            # Windows PowerShell uninstaller
```

**Release a new version (maintainers):** releases are cut automatically by [release-please](https://github.com/googleapis/release-please). Merging a PR with a `feat:` or `fix:` title opens a Release PR that bumps `skills/agentkey/version.txt`, all four versioned plugin manifests, `gemini-extension.json`, and `CHANGELOG.md`. The Antigravity schema has no `version` field, so its root `plugin.json` is not part of version syncing. Merging the Release PR creates the tag + GitHub Release, preserves the `agentkey.skill` asset, and uploads platform-named Gemini extension archives whose roots contain `gemini-extension.json`.

</details>

<details>
<summary><b>What stage is the product at?</b></summary>

Early access. There are rough edges and we appreciate your patience. Feature requests and bug reports are welcome via [GitHub Issues](https://github.com/chainbase-labs/agentkey/issues) or Telegram (see below).

</details>

<details>
<summary><b>Where do I get help / report bugs / follow updates?</b></summary>

- **Telegram:** [t.me/AgentKey_Official](https://t.me/AgentKey_Official) — general questions, support, feature requests
- **Bug reports:** [GitHub Issues](https://github.com/chainbase-labs/agentkey/issues)
- **Release announcements:** ⭐ star this repo to get notified

</details>

---

## Star History

[![Star History Chart](https://api.star-history.com/chart?repos=chainbase-labs/agentkey&type=date&legend=top-left&sealed_token=ZnduG_kCABo_uyUn3A-CRWKj9wC9AMGIDCpvu5PSfSvwKtE9Ab_5PEJNjQoQafwEYOlWr4Ioq_n7wC8vNwlwRMQ-BIz0VmBMNZq0aY-KYlH9S2i_29q9fw)](https://www.star-history.com/?repos=chainbase-labs%2Fagentkey&type=date&legend=top-left)
