#!/usr/bin/env bash
#
# AgentKey installer for macOS and Linux
# Usage: curl -fsSL https://agentkey.app/install.sh | bash
#        curl -fsSL https://agentkey.app/install.sh | bash -s -- --yes
#        curl -fsSL https://agentkey.app/install.sh | bash -s -- --interactive
#        curl -fsSL https://agentkey.app/install.sh | bash -s -- --only claude-code,cursor
#        curl -fsSL https://agentkey.app/install.sh | bash -s -- --skip-mcp
#
# The whole procedural body is wrapped in `main()` so that under `curl | bash`
# bash reads the entire script into memory (as a function definition) before
# executing any of it. Without this wrapper, `exec < /dev/tty` would clobber
# bash's own script-source fd and the shell would hang trying to read the rest
# of itself from the terminal.

set -euo pipefail

# ── Constants ─────────────────────────────────────────────────────────────
SKILL_REPO="chainbase-labs/agentkey"
MCP_PACKAGE="@agentkey/mcp"
NODE_MIN_MAJOR=18

# ── Colors (only if stdout is a TTY) ─────────────────────────────────────
# Use $'...' so variables hold real ESC bytes — otherwise heredoc output prints
# the literal string "\033[1m" instead of applying the SGR code.
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
    BOLD=$'\033[1m'
    ACCENT=$'\033[38;2;0;200;180m'   # AgentKey teal
    INFO=$'\033[38;2;136;146;176m'
    SUCCESS=$'\033[38;2;0;220;150m'
    WARN=$'\033[38;2;255;176;32m'
    ERROR=$'\033[38;2;230;57;70m'
    MUTED=$'\033[38;2;110;118;132m'
    NC=$'\033[0m'
else
    BOLD=''; ACCENT=''; INFO=''; SUCCESS=''; WARN=''; ERROR=''; MUTED=''; NC=''
fi

# ── UI helpers ────────────────────────────────────────────────────────────
ui_banner() {
    printf "\n"
    printf "${ACCENT}   █████   ██████  ███████ ███    ██ ████████ ██   ██ ███████ ██    ██${NC}\n"
    printf "${ACCENT}  ██   ██ ██       ██      ████   ██    ██    ██  ██  ██       ██  ██ ${NC}\n"
    printf "${ACCENT}  ███████ ██   ███ █████   ██ ██  ██    ██    █████   █████     ████  ${NC}\n"
    printf "${ACCENT}  ██   ██ ██    ██ ██      ██  ██ ██    ██    ██  ██  ██         ██   ${NC}\n"
    printf "${ACCENT}  ██   ██  ██████  ███████ ██   ████    ██    ██   ██ ███████    ██   ${NC}\n"
    printf "\n"
    printf "  ${BOLD}One command. Full internet access for your AI agent.${NC}\n"
    printf "  ${MUTED}https://agentkey.app${NC}\n\n"
}

ui_info()  { printf "  ${INFO}›${NC} %s\n" "$*"; }
ui_ok()    { printf "  ${SUCCESS}✓${NC} %s\n" "$*"; }
ui_warn()  { printf "  ${WARN}!${NC} %s\n" "$*"; }
ui_error() { printf "  ${ERROR}✗${NC} %s\n" "$*" >&2; }
ui_step()  { printf "\n  ${BOLD}%s${NC}\n" "$*"; }
ui_muted() { printf "    ${MUTED}%s${NC}\n" "$*"; }

die() { ui_error "$*"; exit 1; }

print_help() {
    cat <<EOF
AgentKey installer for macOS and Linux

Usage:
  curl -fsSL https://agentkey.app/install.sh | bash
  curl -fsSL https://agentkey.app/install.sh | bash -s -- [OPTIONS]

Options:
  --yes, -y           Non-interactive: install skill to every detected agent, no prompts
  --interactive       Force interactive mode (fails if no TTY/terminal is reachable)
  --only <a,b,c>      Only install skill for these agents (comma-separated, e.g. claude-code,cursor)
  --skip-skill        Skip the skill install step (only run MCP auth)
  --skip-mcp          Skip the MCP auth step (only install the skill)
  -h, --help          Show this help

Default: interactive when a terminal is reachable (even under 'curl | bash'),
         otherwise falls back to --yes.
EOF
}

install_node() {
    local platform="$1"
    ui_info "Installing Node.js v$NODE_MIN_MAJOR+ ..."
    if [ "$platform" = "macos" ]; then
        if command -v brew >/dev/null 2>&1; then
            brew install node >/dev/null 2>&1 || die "brew install node failed"
        else
            die "Homebrew not found. Install Node.js v$NODE_MIN_MAJOR+ manually: https://nodejs.org/"
        fi
    else
        # Linux: NodeSource for apt/dnf/yum; apk for Alpine; otherwise manual
        if command -v apt-get >/dev/null 2>&1; then
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - >/dev/null 2>&1 \
                && sudo apt-get install -y nodejs >/dev/null 2>&1 || die "apt install nodejs failed"
        elif command -v dnf >/dev/null 2>&1; then
            curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo -E bash - >/dev/null 2>&1 \
                && sudo dnf install -y nodejs >/dev/null 2>&1 || die "dnf install nodejs failed"
        elif command -v yum >/dev/null 2>&1; then
            curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo -E bash - >/dev/null 2>&1 \
                && sudo yum install -y nodejs >/dev/null 2>&1 || die "yum install nodejs failed"
        elif command -v apk >/dev/null 2>&1; then
            sudo apk add --no-cache nodejs npm >/dev/null 2>&1 || die "apk add nodejs failed"
        else
            die "No supported package manager found. Install Node.js v$NODE_MIN_MAJOR+ manually: https://nodejs.org/"
        fi
    fi
    ui_ok "Node.js installed"
}

# ──────────────────────────────────────────────────────────────────────────
# main — wraps the entire procedural body so that under `curl | bash`
# bash finishes reading the script before any fd-rebinding happens.
# ──────────────────────────────────────────────────────────────────────────
main() {
    local MODE=""
    local ONLY_AGENTS=""
    local SKIP_MCP=false
    local SKIP_SKILL=false
    local PRINT_HELP=false

    while [ $# -gt 0 ]; do
        case "$1" in
            -y|--yes)          MODE=noninteractive; shift ;;
            --interactive)     MODE=interactive; shift ;;
            --only)            ONLY_AGENTS="${2:-}"; shift 2 ;;
            --only=*)          ONLY_AGENTS="${1#*=}"; shift ;;
            --skip-skill)      SKIP_SKILL=true; shift ;;
            --skip-mcp)        SKIP_MCP=true; shift ;;
            -h|--help)         PRINT_HELP=true; shift ;;
            *)                 ui_warn "Unknown argument: $1"; shift ;;
        esac
    done

    if $PRINT_HELP; then print_help; exit 0; fi

    ui_banner

    # ── 1. Preflight ──────────────────────────────────────────────────────
    ui_step "1. Preflight"

    local OS PLATFORM
    OS="$(uname -s)"
    case "$OS" in
        Darwin)  PLATFORM="macos" ;;
        Linux)   PLATFORM="linux" ;;
        *)       die "Unsupported OS: $OS (macOS/Linux only; use install.ps1 on Windows)" ;;
    esac
    ui_ok "Platform: $PLATFORM"

    # Resolve stdin. `curl | bash` eats stdin — but /dev/tty is usually still
    # reachable. Test by *actually opening* /dev/tty in a subshell; `[ -r ]`
    # returns true even when the process has lost its controlling terminal
    # (e.g. backgrounded, daemonized).
    #
    # IMPORTANT: we do NOT `exec < /dev/tty` globally. Under `curl | bash`
    # bash is reading the script from its own stdin (the pipe); a global
    # rebind would hijack bash's script reader and hang after `main` returns
    # (bash would try to read the next byte from /dev/tty instead of EOF).
    # Instead we redirect stdin *per interactive command* below.
    local TTY_AVAILABLE=false
    if ( : < /dev/tty ) >/dev/null 2>&1; then
        TTY_AVAILABLE=true
    fi

    if [ -z "$MODE" ]; then
        if $TTY_AVAILABLE; then
            MODE=interactive
        else
            MODE=noninteractive
            ui_warn "No terminal detected (CI/non-TTY shell) — falling back to --yes"
        fi
    elif [ "$MODE" = interactive ] && ! $TTY_AVAILABLE; then
        die "--interactive requested but no TTY is reachable"
    fi
    ui_ok "Mode: $MODE"

    # Node check
    local NODE_OK=false NODE_VERSION NODE_MAJOR
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION="$(node --version 2>/dev/null | sed 's/^v//')"
        NODE_MAJOR="${NODE_VERSION%%.*}"
        if [ -n "$NODE_MAJOR" ] && [ "$NODE_MAJOR" -ge "$NODE_MIN_MAJOR" ] 2>/dev/null; then
            NODE_OK=true
            ui_ok "Node.js: v$NODE_VERSION"
        else
            ui_warn "Node.js v$NODE_VERSION found but v$NODE_MIN_MAJOR+ is required"
        fi
    fi

    if ! $NODE_OK; then
        if [ "$MODE" = interactive ]; then
            printf "\n  ${BOLD}Node.js v%s+ is required but not found.${NC}\n" "$NODE_MIN_MAJOR"
            printf "  Install it now? [Y/n] "
            local REPLY=""
            # Read directly from the terminal, not from bash's stdin (the pipe)
            read -r REPLY < /dev/tty || REPLY=""
            case "$REPLY" in
                n|N|no|No) die "Node.js required. Aborting." ;;
            esac
        fi
        install_node "$PLATFORM"
    fi

    command -v npx >/dev/null 2>&1 || die "npx not found after Node install — please reinstall Node.js"

    # ── 2. Install the AgentKey skill ─────────────────────────────────────
    if ! $SKIP_SKILL; then
        ui_step "2. Install the AgentKey skill"
        ui_info "The 'skills' CLI will auto-detect every supported agent on this machine."

        local SKILLS_ARGS=(-y skills add "$SKILL_REPO" -g)
        if [ -n "$ONLY_AGENTS" ]; then
            # shellcheck disable=SC2206
            local AGENT_LIST=(${ONLY_AGENTS//,/ })
            SKILLS_ARGS+=(-a "${AGENT_LIST[@]}")
        fi
        if [ "$MODE" = noninteractive ]; then
            SKILLS_ARGS+=(-y)
        fi

        # Route npx's stdin to the terminal so its interactive multi-select can
        # prompt the user — otherwise it inherits bash's piped stdin and breaks.
        # When non-interactive (no TTY), stdin stays as /dev/null via < /dev/null
        # to guarantee npx never blocks waiting for input.
        local npx_stdin="/dev/null"
        if [ "$MODE" = interactive ] && $TTY_AVAILABLE; then
            npx_stdin="/dev/tty"
        fi
        if ! npx "${SKILLS_ARGS[@]}" < "$npx_stdin"; then
            die "Failed to install skill via 'skills' CLI"
        fi
        ui_ok "Skill installed"
    else
        ui_step "2. Install the AgentKey skill"
        ui_muted "Skipped (--skip-skill)"
    fi

    # ── 3. MCP authentication ────────────────────────────────────────────
    if ! $SKIP_MCP; then
        ui_step "3. Register the MCP server (browser login)"
        ui_info "Opening your browser for AgentKey device authentication ..."
        ui_muted "When auth finishes, the MCP server is written into Claude Code / Claude Desktop / Cursor configs."
        echo

        if ! npx -y "$MCP_PACKAGE" --auth-login; then
            ui_error "MCP auth failed."
            ui_muted "Retry manually:  npx -y $MCP_PACKAGE --auth-login"
            exit 1
        fi
        ui_ok "MCP server registered"
    else
        ui_step "3. Register the MCP server"
        ui_muted "Skipped (--skip-mcp)"
    fi

    # ── 4. Summary ───────────────────────────────────────────────────────
    ui_step "✨ Installation complete"
    cat <<EOF

  ${BOLD}Next steps${NC}
    ${MUTED}1.${NC} Restart your agent (Claude Code / Cursor / etc.)
    ${MUTED}2.${NC} Ask it something that needs the internet:
       ${ACCENT}"What has Musk been tweeting about lately?"${NC}

  ${BOLD}If your agent is NOT Claude Code / Claude Desktop / Cursor${NC}
    The skill is installed, but you may need to paste this MCP snippet
    into its config manually:

    ${MUTED}{
      "mcpServers": {
        "agentkey": {
          "command": "npx",
          "args": ["-y", "@agentkey/mcp"],
          "env": { "AGENTKEY_API_KEY": "ak_..." }
        }
      }
    }${NC}

  ${BOLD}Docs${NC}       https://agentkey.app/docs
  ${BOLD}Uninstall${NC}  curl -fsSL https://agentkey.app/uninstall.sh | bash

EOF
}

main "$@"
