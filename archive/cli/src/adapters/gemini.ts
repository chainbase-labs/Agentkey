import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { BaseAdapter, type McpFormat } from './base.js';
import type { Scope } from '../types.js';

export class GeminiAdapter extends BaseAdapter {
  id = 'gemini'; displayName = 'Gemini CLI';
  mode = 'full' as const;
  supportedScopes: Scope[] = ['global', 'project'];
  mcpFormat: McpFormat = 'json';
  async detect() { return fs.stat(join(this.home, '.gemini')).then(() => true).catch(() => false); }
  resolveSkillTarget(scope: Scope, projectDir?: string) {
    return join(scope === 'global' ? this.home : projectDir!, '.gemini', 'skills', 'agentkey');
  }
  resolveMcpConfigPath(scope: Scope, projectDir?: string) {
    return join(scope === 'global' ? this.home : projectDir!, '.gemini', 'settings.json');
  }
}
