import type { HostAdapter, InstallOpts, InstallResult, InstallState, Mode, Scope } from '../types.js';
import { buildEntry } from '../mcp/entry.js';
import { join } from 'node:path';

export class ManusAdapter implements HostAdapter {
  id = 'manus';
  displayName = 'Manus';
  mode: Mode = 'snippet';
  supportedScopes: Scope[] = ['global'];

  async detect(): Promise<boolean> { return true; }
  async isAlreadyInstalled(): Promise<InstallState> { return 'none'; }

  async install(opts: InstallOpts): Promise<InstallResult> {
    const snippet = JSON.stringify({ mcpServers: { agentkey: buildEntry(opts.apiKey) } }, null, 2);
    return {
      postInstructions:
        `Manus is cloud-hosted — no local install possible. To enable AgentKey in Manus:\n\n` +
        `1. Open https://manus.im settings → Integrations → MCP Servers, paste this config:\n\n` +
        `${snippet}\n\n` +
        `2. Copy the contents of ${join(opts.sourceDir, 'SKILL.md')} into your Manus system prompt or knowledge base.`
    };
  }

  async uninstall(): Promise<void> { /* noop */ }
}
