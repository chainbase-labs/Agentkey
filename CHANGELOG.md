# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-22

Initial public release.

### Added
- Unified AgentKey Skill for Claude Code, Claude Desktop, Cursor, and other Skills-CLI-compatible agents
- Coverage: 12 social media platforms (Twitter/X, Reddit, 小红书, Instagram, 知乎, TikTok, 抖音, B站, 微博, Threads, YouTube, LinkedIn), web search, web scraping, crypto/blockchain data
- One-command installers: `scripts/install.sh` (macOS/Linux) and `scripts/install.ps1` (Windows)
- `npx skills add chainbase-labs/agentkey` as the Skills-CLI install path
- MCP server registration via `npx -y @agentkey/mcp --auth-login`
