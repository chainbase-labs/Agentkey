#Requires -Version 5.1
<#
.SYNOPSIS
    AgentKey installer for Windows
.DESCRIPTION
    Usage:
        irm https://agentkey.app/install.ps1 | iex
        & ([scriptblock]::Create((irm https://agentkey.app/install.ps1))) -Yes
        & ([scriptblock]::Create((irm https://agentkey.app/install.ps1))) -Only "claude-code,cursor"

    Behavior mirrors install.sh: checks Node >= 18 (installs via winget/scoop/choco),
    runs `npx skills add` (auto-detects agents), then `npx @agentkey/mcp --auth-login`
    to open a browser for device auth. MCP config is written automatically for
    Claude Code / Claude Desktop / Cursor.
#>

[CmdletBinding()]
param(
    [switch]$Yes,
    [switch]$Interactive,
    [string]$Only,
    [switch]$SkipSkill,
    [switch]$SkipMcp,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'
$SkillRepo   = 'chainbase-labs/agentkey'
$McpPackage  = '@agentkey/mcp'
$NodeMinMajor = 18

# ── UI helpers ────────────────────────────────────────────────────────────
function Write-Banner {
    Write-Host ''
    Write-Host '   █████   ██████  ███████ ███    ██ ████████ ██   ██ ███████ ██    ██' -ForegroundColor Cyan
    Write-Host '  ██   ██ ██       ██      ████   ██    ██    ██  ██  ██       ██  ██ ' -ForegroundColor Cyan
    Write-Host '  ███████ ██   ███ █████   ██ ██  ██    ██    █████   █████     ████  ' -ForegroundColor Cyan
    Write-Host '  ██   ██ ██    ██ ██      ██  ██ ██    ██    ██  ██  ██         ██   ' -ForegroundColor Cyan
    Write-Host '  ██   ██  ██████  ███████ ██   ████    ██    ██   ██ ███████    ██   ' -ForegroundColor Cyan
    Write-Host ''
    Write-Host '  One command. Full internet access for your AI agent.' -ForegroundColor White
    Write-Host '  https://agentkey.app' -ForegroundColor DarkGray
    Write-Host ''
}

function Write-Step ($text) { Write-Host ''; Write-Host "  $text" -ForegroundColor White }
function Write-Info ($text) { Write-Host "  › $text" -ForegroundColor Gray }
function Write-Ok   ($text) { Write-Host "  ✓ $text" -ForegroundColor Green }
function Write-Warn2($text) { Write-Host "  ! $text" -ForegroundColor Yellow }
function Write-Err  ($text) { Write-Host "  ✗ $text" -ForegroundColor Red }
function Write-Muted($text) { Write-Host "    $text" -ForegroundColor DarkGray }

function Die ($text) { Write-Err $text; exit 1 }

# ── Help ──────────────────────────────────────────────────────────────────
if ($Help) {
    @'
AgentKey installer for Windows

Usage:
  irm https://agentkey.app/install.ps1 | iex
  & ([scriptblock]::Create((irm https://agentkey.app/install.ps1))) -Yes

Parameters:
  -Yes              Non-interactive: install skill to every detected agent, no prompts
  -Interactive      Force interactive mode (fails if console input is redirected)
  -Only <a,b,c>     Only install skill for these agents (e.g. "claude-code,cursor")
  -SkipSkill        Skip the skill install step (only run MCP auth)
  -SkipMcp          Skip the MCP auth step (only install the skill)
  -Help             Show this help
'@
    exit 0
}

Write-Banner

# ── 1. Preflight ──────────────────────────────────────────────────────────
Write-Step '1. Preflight'

# Platform guard
if (-not $IsWindows -and $PSVersionTable.PSVersion.Major -ge 6) {
    Die 'This script targets Windows. On macOS/Linux use install.sh instead.'
}
Write-Ok 'Platform: windows'

# Resolve interactive mode. PowerShell's `iex` runs in the current session, so
# Read-Host works natively even under `irm | iex`. The only thing we need to
# guard is truly redirected input (scheduled tasks, CI with redirected stdin).
$InputRedirected = $false
try { $InputRedirected = [Console]::IsInputRedirected } catch { $InputRedirected = $false }

$Mode = $null
if ($Yes) { $Mode = 'noninteractive' }
elseif ($Interactive) {
    if ($InputRedirected) { Die '-Interactive requested but console input is redirected.' }
    $Mode = 'interactive'
}
elseif ($InputRedirected) {
    $Mode = 'noninteractive'
    Write-Warn2 'No interactive console detected — falling back to -Yes'
}
else {
    $Mode = 'interactive'
}
Write-Ok "Mode: $Mode"

# Node check
function Get-NodeMajor {
    try {
        $v = (& node --version) 2>$null
        if ($v -match '^v(\d+)\.') { return [int]$Matches[1] }
    } catch {}
    return 0
}

function Install-Node {
    Write-Info "Installing Node.js LTS ..."
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install -e --id OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements | Out-Null
    } elseif (Get-Command scoop -ErrorAction SilentlyContinue) {
        scoop install nodejs-lts | Out-Null
    } elseif (Get-Command choco -ErrorAction SilentlyContinue) {
        choco install nodejs-lts -y | Out-Null
    } else {
        Die 'No package manager found (winget/scoop/choco). Install Node.js LTS manually: https://nodejs.org/'
    }
    # Refresh PATH so this session sees the newly installed node
    $env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
                [System.Environment]::GetEnvironmentVariable('Path', 'User')
    Write-Ok 'Node.js installed'
}

$nodeMajor = Get-NodeMajor
if ($nodeMajor -ge $NodeMinMajor) {
    Write-Ok "Node.js: v$nodeMajor.x"
} else {
    if ($nodeMajor -gt 0) { Write-Warn2 "Node.js v$nodeMajor found but v$NodeMinMajor+ is required" }
    if ($Mode -eq 'interactive') {
        Write-Host ''
        Write-Host "  Node.js v$NodeMinMajor+ is required but not found." -ForegroundColor White
        $reply = Read-Host '  Install it now? [Y/n]'
        if ($reply -match '^(n|no)$') { Die 'Node.js required. Aborting.' }
    }
    Install-Node
}

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Die 'npx not found after Node install — please reopen your terminal or reinstall Node.js.'
}

# ── 2. Install the AgentKey skill ─────────────────────────────────────────
if (-not $SkipSkill) {
    Write-Step '2. Install the AgentKey skill'
    Write-Info "The 'skills' CLI will auto-detect every supported agent on this machine."

    $skillsArgs = @('-y', 'skills', 'add', $SkillRepo, '-g')
    if ($Only) {
        $agentList = $Only -split ',' | Where-Object { $_ -ne '' }
        $skillsArgs += '-a'
        $skillsArgs += $agentList
    }
    if ($Mode -eq 'noninteractive') { $skillsArgs += '-y' }

    & npx @skillsArgs
    if ($LASTEXITCODE -ne 0) { Die "Failed to install skill via 'skills' CLI" }
    Write-Ok 'Skill installed'
} else {
    Write-Step '2. Install the AgentKey skill'
    Write-Muted 'Skipped (-SkipSkill)'
}

# ── 3. MCP authentication ────────────────────────────────────────────────
if (-not $SkipMcp) {
    Write-Step '3. Register the MCP server (browser login)'
    Write-Info 'Opening your browser for AgentKey device authentication ...'
    Write-Muted 'When auth finishes, the MCP server is written into Claude Code / Claude Desktop / Cursor configs.'
    Write-Host ''

    & npx -y $McpPackage --auth-login
    if ($LASTEXITCODE -ne 0) {
        Write-Err 'MCP auth failed.'
        Write-Muted "Retry manually:  npx -y $McpPackage --auth-login"
        exit 1
    }
    Write-Ok 'MCP server registered'
} else {
    Write-Step '3. Register the MCP server'
    Write-Muted 'Skipped (-SkipMcp)'
}

# ── 4. Summary ───────────────────────────────────────────────────────────
Write-Step '✨ Installation complete'
Write-Host ''
Write-Host '  Next steps' -ForegroundColor White
Write-Muted '1. Restart your agent (Claude Code / Cursor / etc.)'
Write-Muted '2. Ask it something that needs the internet:'
Write-Host '       "What has Musk been tweeting about lately?"' -ForegroundColor Cyan
Write-Host ''
Write-Host '  If your agent is NOT Claude Code / Claude Desktop / Cursor' -ForegroundColor White
Write-Muted 'The skill is installed, but you may need to paste this MCP snippet'
Write-Muted 'into its config manually:'
Write-Host ''
Write-Host '    {' -ForegroundColor DarkGray
Write-Host '      "mcpServers": {' -ForegroundColor DarkGray
Write-Host '        "agentkey": {' -ForegroundColor DarkGray
Write-Host '          "command": "npx",' -ForegroundColor DarkGray
Write-Host '          "args": ["-y", "@agentkey/mcp"],' -ForegroundColor DarkGray
Write-Host '          "env": { "AGENTKEY_API_KEY": "ak_..." }' -ForegroundColor DarkGray
Write-Host '        }' -ForegroundColor DarkGray
Write-Host '      }' -ForegroundColor DarkGray
Write-Host '    }' -ForegroundColor DarkGray
Write-Host ''
Write-Host '  Docs       https://agentkey.app/docs' -ForegroundColor White
Write-Host '  Uninstall  irm https://agentkey.app/uninstall.ps1 | iex' -ForegroundColor White
Write-Host ''
