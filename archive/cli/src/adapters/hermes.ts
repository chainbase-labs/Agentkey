import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { BaseAdapter, type McpFormat } from './base.js';
import type { Scope } from '../types.js';

export class HermesAdapter extends BaseAdapter {
  id = 'hermes'; displayName = 'Hermes Agent';
  mode = 'full' as const;
  supportedScopes: Scope[] = ['global', 'project'];
  mcpFormat: McpFormat = 'yaml';
  async detect() { return fs.stat(join(this.home, '.hermes')).then(() => true).catch(() => false); }
  resolveSkillTarget(scope: Scope, projectDir?: string) {
    return join(scope === 'global' ? this.home : projectDir!, '.hermes', 'skills', 'agentkey');
  }
  resolveMcpConfigPath(scope: Scope, projectDir?: string) {
    return join(scope === 'global' ? this.home : projectDir!, '.hermes', 'config.yaml');
  }
}
