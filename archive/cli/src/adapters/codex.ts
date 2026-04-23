import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { BaseAdapter, type McpFormat } from './base.js';
import type { Scope } from '../types.js';

export class CodexAdapter extends BaseAdapter {
  id = 'codex'; displayName = 'Codex CLI';
  mode = 'full' as const;
  supportedScopes: Scope[] = ['global', 'project'];
  mcpFormat: McpFormat = 'toml';
  async detect() { return fs.stat(join(this.home, '.codex')).then(() => true).catch(() => false); }
  resolveSkillTarget(scope: Scope, projectDir?: string) {
    return join(scope === 'global' ? this.home : projectDir!, '.codex', 'skills', 'agentkey');
  }
  resolveMcpConfigPath(scope: Scope, projectDir?: string) {
    return join(scope === 'global' ? this.home : projectDir!, '.codex', 'config.toml');
  }
}
