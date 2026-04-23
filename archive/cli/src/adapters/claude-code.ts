import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { BaseAdapter, type McpFormat } from './base.js';
import type { InstallState, Scope } from '../types.js';
import { hasJsonMcp } from '../mcp/json-writer.js';

export class ClaudeCodeAdapter extends BaseAdapter {
  id = 'claude-code';
  displayName = 'Claude Code';
  mode = 'full' as const;
  supportedScopes: Scope[] = ['global', 'project'];
  mcpFormat: McpFormat = 'json';

  async detect(): Promise<boolean> {
    return fs.stat(join(this.home, '.claude')).then(() => true).catch(() => false);
  }

  async isAlreadyInstalled(scope: Scope, projectDir?: string): Promise<InstallState> {
    const pluginDir = join(this.home, '.claude', 'plugins', 'agentkey-skill');
    if (await fs.stat(pluginDir).then(() => true).catch(() => false)) {
      return 'via-plugin';
    }
    const cfgPath = this.resolveMcpConfigPath(scope, projectDir);
    if (await hasJsonMcp(cfgPath)) return 'via-cli';
    return 'none';
  }

  resolveSkillTarget(scope: Scope, projectDir?: string): string {
    const root = scope === 'global' ? this.home : projectDir!;
    return join(root, '.claude', 'skills', 'agentkey');
  }

  resolveMcpConfigPath(scope: Scope, projectDir?: string): string {
    if (scope === 'global') return join(this.home, '.claude.json');
    return join(projectDir!, '.mcp.json');
  }
}
