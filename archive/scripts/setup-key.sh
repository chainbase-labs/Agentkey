#!/bin/bash
# AgentKey — Persist API key to ~/.env.local
#
# Writes AGENTKEY_API_KEY="<key>" into ~/.env.local so that the MCP server
# reads it automatically via NODE_OPTIONS=--env-file on every startup.
# No shell sourcing or CLI restart required.
#
# Idempotent: safe to run multiple times. Updates the existing entry.
# Usage: bash setup-key.sh <API_KEY>
# Outputs: INJECTED | UPDATED | ALREADY_CURRENT | ERROR:<reason>

set -euo pipefail

KEY="${1:-}"
if [ -z "$KEY" ]; then
    echo "ERROR: no key provided"
    exit 1
fi

ENV_FILE="$HOME/.env.local"
touch "$ENV_FILE"

if grep -q "^AGENTKEY_API_KEY=" "$ENV_FILE" 2>/dev/null; then
    CURRENT_KEY=$(grep "^AGENTKEY_API_KEY=" "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"')
    if [ "$CURRENT_KEY" = "$KEY" ]; then
        echo "ALREADY_CURRENT"
        exit 0
    fi
    # Update existing entry
    python3 -c "
import re
content = open('$ENV_FILE').read()
new = re.sub(r'^AGENTKEY_API_KEY=.*$', 'AGENTKEY_API_KEY=\"$KEY\"', content, flags=re.MULTILINE)
open('$ENV_FILE', 'w').write(new)
"
    echo "UPDATED"
else
    printf 'AGENTKEY_API_KEY="%s"\n' "$KEY" >> "$ENV_FILE"
    echo "INJECTED"
fi
