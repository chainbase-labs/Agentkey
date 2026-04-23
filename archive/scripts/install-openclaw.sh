#!/bin/bash
#
# AgentKey Skill Installer for OpenClaw
# 
# This script installs AgentKey Skill and configures MCP server
# Supports both native MCP (v2026.3.24+) and mcporter (older versions)
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SKILL_NAME="agentkey"
SKILL_REPO="chainbase-labs/AgentKey-Skill"
MCP_SERVER_PACKAGE="@agentkey/mcp"
MIN_NATIVE_VERSION="2026.3.24"

# Paths
OPENCLAW_CONFIG_DIR="${HOME}/.openclaw"
SKILLS_DIR="${OPENCLAW_CONFIG_DIR}/agents/chainbase/skills"
AGENTKEY_SKILL_DIR="${SKILLS_DIR}/${SKILL_NAME}"

# ============================================
# Helper Functions
# ============================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get OpenClaw version
get_openclaw_version() {
    if command_exists openclaw; then
        openclaw --version 2>/dev/null | grep -oP 'OpenClaw \K[0-9.]+' || echo ""
    else
        echo ""
    fi
}

# Compare versions
# Returns: 0 if v1 >= v2, 1 otherwise
version_ge() {
    local v1="$1"
    local v2="$2"
    
    # Use sort -V for version comparison
    if [ "$(printf '%s\n%s\n' "$v1" "$v2" | sort -V | head -n1)" = "$v2" ]; then
        return 0
    else
        return 1
    fi
}

# Check if mcporter skill is installed
check_mcporter_installed() {
    if [ -d "${OPENCLAW_CONFIG_DIR}/skills/mcporter" ] || \
       [ -d "${SKILLS_DIR}/../mcporter" ] || \
       openclaw skills list 2>/dev/null | grep -q "mcporter"; then
        return 0
    fi
    return 1
}

# Install mcporter skill
install_mcporter() {
    log_info "Installing mcporter skill..."
    
    if openclaw skills install mcporter 2>/dev/null; then
        log_success "mcporter skill installed successfully"
        return 0
    else
        log_error "Failed to install mcporter skill"
        return 1
    fi
}

# Clone AgentKey Skill
clone_skill() {
    log_info "Cloning AgentKey Skill from GitHub..."
    
    # Create skills directory if not exists
    mkdir -p "${SKILLS_DIR}"
    
    # Remove existing installation
    if [ -d "${AGENTKEY_SKILL_DIR}" ]; then
        log_warn "Existing AgentKey Skill found, updating..."
        rm -rf "${AGENTKEY_SKILL_DIR}"
    fi
    
    # Clone the repository
    if command_exists git; then
        git clone --depth 1 "https://github.com/${SKILL_REPO}.git" "${AGENTKEY_SKILL_DIR}" 2>/dev/null
        if [ $? -eq 0 ]; then
            log_success "AgentKey Skill cloned successfully"
            return 0
        fi
    fi
    
    # Fallback: download and extract
    log_info "Trying alternative download method..."
    local temp_dir=$(mktemp -d)
    local latest_release=$(curl -s "https://api.github.com/repos/${SKILL_REPO}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    
    if [ -n "$latest_release" ]; then
        curl -L "https://github.com/${SKILL_REPO}/archive/refs/tags/${latest_release}.tar.gz" -o "${temp_dir}/agentkey.tar.gz" 2>/dev/null
        if [ -f "${temp_dir}/agentkey.tar.gz" ]; then
            tar -xzf "${temp_dir}/agentkey.tar.gz" -C "${temp_dir}" 2>/dev/null
            mv "${temp_dir}/AgentKey-Skill-${latest_release#v}" "${AGENTKEY_SKILL_DIR}" 2>/dev/null
            rm -rf "${temp_dir}"
            log_success "AgentKey Skill downloaded successfully"
            return 0
        fi
    fi
    
    rm -rf "${temp_dir}"
    log_error "Failed to download AgentKey Skill"
    return 1
}

# Configure MCP for native OpenClaw (v2026.3.24+)
configure_native_mcp() {
    log_info "Configuring native MCP for OpenClaw ${OPENCLAW_VERSION}..."
    
    local api_key="$1"
    
    # Use openclaw mcp set command
    local mcp_config=$(cat <<EOF
{
  "command": "npx",
  "args": ["-y", "${MCP_SERVER_PACKAGE}"],
  "env": {
    "AGENTKEY_API_KEY": "${api_key}"
  }
}
EOF
)
    
    if openclaw mcp set agentkey "$mcp_config" 2>/dev/null; then
        log_success "MCP server configured successfully (native)"
        return 0
    else
        log_error "Failed to configure MCP server"
        return 1
    fi
}

# Configure MCP using mcporter
configure_mcporter_mcp() {
    log_info "Configuring MCP using mcporter..."
    
    local api_key="$1"
    
    # Check if mcporter is installed
    if ! check_mcporter_installed; then
        log_warn "mcporter not found, attempting to install..."
        if ! install_mcporter; then
            log_error "Failed to install mcporter"
            return 1
        fi
    fi
    
    # Use mcporter to configure
    # Note: mcporter commands may vary based on actual implementation
    log_info "Adding MCP server via mcporter..."
    
    # Create mcporter config
    local mcporter_config_dir="${OPENCLAW_CONFIG_DIR}/mcporter"
    mkdir -p "${mcporter_config_dir}"
    
    cat > "${mcporter_config_dir}/agentkey.json" <<EOF
{
  "name": "agentkey",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "${MCP_SERVER_PACKAGE}"],
  "env": {
    "AGENTKEY_API_KEY": "${api_key}"
  }
}
EOF
    
    log_success "MCP server configured successfully (mcporter)"
    log_warn "Please restart OpenClaw to apply changes"
    return 0
}

# Setup skill injection
setup_skill_injection() {
    log_info "Setting up skill injection..."
    
    # Check if inject.sh exists
    local inject_script="${AGENTKEY_SKILL_DIR}/scripts/inject.sh"
    if [ -f "$inject_script" ]; then
        bash "$inject_script" 2>/dev/null
        log_success "Skill injection completed"
    else
        log_warn "inject.sh not found, skipping injection"
    fi
}

# Verify installation
verify_installation() {
    log_info "Verifying installation..."
    
    local status="OK"
    
    # Check skill directory
    if [ ! -d "$AGENTKEY_SKILL_DIR" ]; then
        log_error "Skill directory not found"
        status="FAILED"
    fi
    
    # Check MCP configuration
    if command_exists openclaw; then
        local mcp_list=$(openclaw mcp list 2>/dev/null || echo "")
        if echo "$mcp_list" | grep -q "agentkey"; then
            log_success "MCP server is registered"
        else
            log_warn "MCP server may not be properly registered"
            status="PARTIAL"
        fi
    fi
    
    # Check API key
    if [ -f "${OPENCLAW_CONFIG_DIR}/.agentkey.env" ]; then
        if grep -q "AGENTKEY_API_KEY" "${OPENCLAW_CONFIG_DIR}/.agentkey.env"; then
            log_success "API key is configured"
        fi
    fi
    
    if [ "$status" = "OK" ]; then
        log_success "Installation verification passed!"
        return 0
    elif [ "$status" = "PARTIAL" ]; then
        log_warn "Installation completed with warnings"
        return 0
    else
        log_error "Installation verification failed"
        return 1
    fi
}

# Print usage
print_usage() {
    cat <<EOF
AgentKey Skill Installer for OpenClaw

Usage: $0 [OPTIONS] [API_KEY]

Options:
    -h, --help          Show this help message
    -f, --force         Force reinstall even if already installed
    -v, --verbose       Enable verbose output
    --skip-mcp          Skip MCP server configuration
    --use-mcporter      Force use mcporter even on native versions

Arguments:
    API_KEY             Your AgentKey API Key (optional, will prompt if not provided)

Examples:
    $0                                    # Interactive installation
    $0 ak_your_api_key_here              # Install with API key
    $0 -f ak_your_api_key_here           # Force reinstall

Get your API Key at: https://console.agentkey.app/
EOF
}

# ============================================
# Main
# ============================================

main() {
    local api_key=""
    local force=false
    local verbose=false
    local skip_mcp=false
    local use_mcporter=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                print_usage
                exit 0
                ;;
            -f|--force)
                force=true
                shift
                ;;
            -v|--verbose)
                verbose=true
                shift
                ;;
            --skip-mcp)
                skip_mcp=true
                shift
                ;;
            --use-mcporter)
                use_mcporter=true
                shift
                ;;
            ak_*)
                api_key="$1"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                print_usage
                exit 1
                ;;
        esac
    done
    
    # Enable verbose mode if requested
    if [ "$verbose" = true ]; then
        set -x
    fi
    
    echo "========================================"
    echo "AgentKey Skill Installer for OpenClaw"
    echo "========================================"
    echo
    
    # Check prerequisites
    log_info "Checking prerequisites..."
    
    if ! command_exists openclaw; then
        log_error "OpenClaw not found. Please install OpenClaw first."
        exit 1
    fi
    
    OPENCLAW_VERSION=$(get_openclaw_version)
    if [ -z "$OPENCLAW_VERSION" ]; then
        log_warn "Could not detect OpenClaw version"
        OPENCLAW_VERSION="unknown"
    fi
    
    log_info "OpenClaw version: $OPENCLAW_VERSION"
    
    # Check if already installed
    if [ "$force" = false ] && [ -d "$AGENTKEY_SKILL_DIR" ]; then
        log_warn "AgentKey Skill is already installed"
        log_info "Use -f or --force to reinstall"
        
        # Still check MCP config
        if [ "$skip_mcp" = false ]; then
            read -p "Do you want to reconfigure MCP server? [y/N] " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_info "Skipping reconfiguration"
                exit 0
            fi
        fi
    fi
    
    # Get API key if not provided
    if [ -z "$api_key" ]; then
        echo
        echo "Please get your API Key from: https://console.agentkey.app/"
        echo "(It's free to get started)"
        echo
        read -p "Enter your AgentKey API Key: " api_key
        
        if [ -z "$api_key" ]; then
            log_error "API Key is required"
            exit 1
        fi
    fi
    
    # Validate API key format
    if [[ ! "$api_key" =~ ^ak_[a-f0-9]{64}$ ]]; then
        log_warn "API key format looks unusual (expected: ak_ followed by 64 hex characters)"
        read -p "Continue anyway? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Clone skill
    echo
    if ! clone_skill; then
        exit 1
    fi
    
    # Setup skill injection
    echo
    setup_skill_injection
    
    # Configure MCP
    if [ "$skip_mcp" = false ]; then
        echo
        # Determine which MCP method to use
        local use_native=false
        
        if [ "$use_mcporter" = false ]; then
            if [ "$OPENCLAW_VERSION" != "unknown" ]; then
                if version_ge "$OPENCLAW_VERSION" "$MIN_NATIVE_VERSION"; then
                    use_native=true
                fi
            fi
        fi
        
        if [ "$use_native" = true ]; then
            log_info "Using native MCP support (OpenClaw >= $MIN_NATIVE_VERSION)"
            if ! configure_native_mcp "$api_key"; then
                log_warn "Native MCP configuration failed, falling back to mcporter..."
                if ! configure_mcporter_mcp "$api_key"; then
                    exit 1
                fi
            fi
        else
            if [ "$OPENCLAW_VERSION" != "unknown" ] && [ "$use_mcporter" = false ]; then
                log_info "OpenClaw version < $MIN_NATIVE_VERSION, using mcporter"
            elif [ "$use_mcporter" = true ]; then
                log_info "Using mcporter (as requested)"
            fi
            
            if ! configure_mcporter_mcp "$api_key"; then
                exit 1
            fi
        fi
    fi
    
    # Save API key to env file
    echo "AGENTKEY_API_KEY=${api_key}" > "${OPENCLAW_CONFIG_DIR}/.agentkey.env"
    chmod 600 "${OPENCLAW_CONFIG_DIR}/.agentkey.env"
    
    # Verify installation
    echo
    if verify_installation; then
        echo
        echo "========================================"
        log_success "AgentKey Skill installed successfully!"
        echo "========================================"
        echo
        echo "You can now use AgentKey tools:"
        echo "  - agentkey_search    : Web search"
        echo "  - agentkey_scrape    : Web scraping"
        echo "  - agentkey_social    : Social media"
        echo "  - agentkey_crypto    : Crypto data"
        echo
        
        if [ "$use_native" = false ] && [ "$skip_mcp" = false ]; then
            log_warn "Please restart OpenClaw to apply MCP changes"
        fi
        
        echo "Get started:"
        echo "  openclaw mcp list                    # Check MCP servers"
        echo "  openclaw skills list                 # Check installed skills"
        echo
    else
        echo
        log_error "Installation completed with errors"
        exit 1
    fi
}

# Run main
main "$@"
