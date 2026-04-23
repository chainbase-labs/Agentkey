import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { BaseAdapter, type McpFormat } from './base.js';
import type { Scope } from '../types.js';

export class OpenClawAdapter extends BaseAdapter {
  id = 'openclaw'; displayName = 'OpenClaw';
  mode = 'full' as const;
  supportedScopes: Scope[] = ['global', 'project'];
  mcpFormat: McpFormat = 'json';
  async detect() { return fs.stat(join(this.home, '.openclaw')).then(() => true).catch(() => false); }
  resolveSkillTarget(scope: Scope, projectDir?: string) {
    return join(scope === 'global' ? this.home : projectDir!, '.openclaw', 'skills', 'agentkey');
  }
  resolveMcpConfigPath(scope: Scope, projectDir?: string) {
    return join(scope === 'global' ? this.home : projectDir!, '.openclaw', 'config.json');
  }
}
