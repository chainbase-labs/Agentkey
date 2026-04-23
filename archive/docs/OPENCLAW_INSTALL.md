# AgentKey Skill for OpenClaw

One command. Full internet access for your AI agent on OpenClaw.

## Quick Install

### Option 1: One-liner (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/chainbase-labs/AgentKey-Skill/main/scripts/install-openclaw.sh | bash
```

Or with your API key:

```bash
curl -fsSL https://raw.githubusercontent.com/chainbase-labs/AgentKey-Skill/main/scripts/install-openclaw.sh | bash -s -- ak_your_api_key_here
```

### Option 2: Download and Run

```bash
# Download the script
curl -fsSL -o install-openclaw.sh https://raw.githubusercontent.com/chainbase-labs/AgentKey-Skill/main/scripts/install-openclaw.sh

# Make it executable
chmod +x install-openclaw.sh

# Run it
./install-openclaw.sh

# Or with your API key
./install-openclaw.sh ak_your_api_key_here
```

### Option 3: Clone and Install

```bash
# Clone the repository
git clone https://github.com/chainbase-labs/AgentKey-Skill.git

# Run the installer
cd AgentKey-Skill
./scripts/install-openclaw.sh
```

## Prerequisites

1. **OpenClaw installed** - Make sure you have OpenClaw installed and in your PATH
2. **AgentKey API Key** - Get your free API key at [console.agentkey.app](https://console.agentkey.app/)

## How It Works

The installer automatically detects your OpenClaw version and configures MCP accordingly:

| OpenClaw Version | MCP Method | Notes |
|-----------------|------------|-------|
| v2026.3.24+ | Native MCP | Uses `openclaw mcp set` command |
| < v2026.3.24 | mcporter | Uses mcporter skill for MCP integration |

## Features

- ✅ **Auto-detect OpenClaw version** - Automatically chooses the right MCP method
- ✅ **Skill installation** - Clones and installs AgentKey Skill
- ✅ **MCP configuration** - Configures MCP server with your API key
- ✅ **Fallback support** - Falls back to mcporter if native MCP fails
- ✅ **Idempotent** - Safe to run multiple times
- ✅ **Verification** - Verifies installation after completion

## Usage

### Basic Usage

```bash
# Interactive installation (will prompt for API key)
./install-openclaw.sh

# Install with API key
./install-openclaw.sh ak_your_api_key_here
```

### Options

```bash
# Force reinstall even if already installed
./install-openclaw.sh -f ak_your_api_key_here

# Verbose mode (show debug output)
./install-openclaw.sh -v ak_your_api_key_here

# Skip MCP server configuration
./install-openclaw.sh --skip-mcp

# Force use mcporter even on native versions
./install-openclaw.sh --use-mcporter ak_your_api_key_here
```

## After Installation

### Verify Installation

```bash
# List MCP servers
openclaw mcp list

# Should see:
# agentkey  npx -y @agentkey/mcp

# List installed skills
openclaw skills list
```

### Use AgentKey

Once installed, your OpenClaw agent can use these tools:

| Tool | Description |
|------|-------------|
| `agentkey_search` | Web search (Brave, Perplexity, Tavily, Serper) |
| `agentkey_scrape` | Web scraping (Firecrawl, Jina, ScrapeNinja) |
| `agentkey_social` | Social media (Twitter, Reddit, 小红书, Instagram, etc.) |
| `agentkey_crypto` | Crypto data (Chainbase, CoinMarketCap, Dexscreener) |

### Example Queries

```
Search for latest AI news
What are people saying about Bitcoin on Twitter?
Scrape https://example.com and summarize
Check the trending topics on Douyin
```

## Troubleshooting

### OpenClaw not found

Make sure OpenClaw is installed and in your PATH:

```bash
# Check if OpenClaw is installed
which openclaw
openclaw --version

# If not found, add to PATH
export PATH="$PATH:$HOME/.openclaw/bin"
```

### MCP configuration failed

If MCP configuration fails, try:

```bash
# Check OpenClaw version
openclaw --version

# Manually configure MCP
openclaw mcp set agentkey '{
  "command": "npx",
  "args": ["-y", "@agentkey/mcp"],
  "env": {
    "AGENTKEY_API_KEY": "your_api_key_here"
  }
}'
```

### mcporter not found (older OpenClaw versions)

If you're on OpenClaw < v2026.3.24 and mcporter installation fails:

```bash
# Install mcporter manually
openclaw skills install mcporter

# Then re-run the installer
./install-openclaw.sh
```

## Uninstall

```bash
# Remove skill directory
rm -rf ~/.openclaw/agents/chainbase/skills/agentkey

# Remove MCP configuration
openclaw mcp unset agentkey

# Remove API key
rm ~/.openclaw/.agentkey.env
```

## Supported Platforms

| Platform | Status |
|----------|--------|
| macOS | ✅ Supported |
| Linux | ✅ Supported |
| Windows (WSL) | ✅ Supported |
| Windows (native) | ⚠️ Experimental |

## Requirements

- OpenClaw v2026.1.0 or later
- Node.js (for npx)
- curl or wget
- git (optional, for cloning)

## Get Help

- **Documentation**: https://github.com/chainbase-labs/AgentKey-Skill
- **API Console**: https://console.agentkey.app/
- **Support**: https://t.me/agentkey33
- **Issues**: https://github.com/chainbase-labs/AgentKey-Skill/issues

## License

MIT License - see [LICENSE](../LICENSE) for details.
