import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { BaseAdapter, type McpFormat } from './base.js';
import type { InstallOpts, InstallResult, Scope } from '../types.js';

export const MDC_WRAPPER = `---
description: AgentKey — real-time data (social/crypto/web/scrape)
globs: ["**/*"]
alwaysApply: false
---

See the skill documentation at ./agentkey/SKILL.md for decision tree and tool usage.
`;

export class CursorAdapter extends BaseAdapter {
  id = 'cursor';
  displayName = 'Cursor';
  mode = 'full' as const;
  supportedScopes: Scope[] = ['global', 'project'];
  mcpFormat: McpFormat = 'json';

  async detect(): Promise<boolean> {
    return fs.stat(join(this.home, '.cursor')).then(() => true).catch(() => false);
  }

  resolveSkillTarget(scope: Scope, projectDir?: string): string {
    const root = scope === 'global' ? this.home : projectDir!;
    return join(root, '.cursor', 'rules', 'agentkey');
  }

  resolveMcpConfigPath(scope: Scope, projectDir?: string): string {
    const root = scope === 'global' ? this.home : projectDir!;
    return join(root, '.cursor', 'mcp.json');
  }

  async install(opts: InstallOpts): Promise<InstallResult> {
    const result = await super.install(opts);
    const mdcPath = join(this.resolveSkillTarget(opts.scope, opts.projectDir), '..', 'agentkey.mdc');
    const existing = await fs.readFile(mdcPath, 'utf8').catch(() => null);
    if (existing === null) {
      await fs.writeFile(mdcPath, MDC_WRAPPER);
    } else if (existing !== MDC_WRAPPER) {
      throw new Error(`Refusing to overwrite existing Cursor rule at ${mdcPath}`);
    }
    return result;
  }

  async uninstall(scope: Scope, projectDir?: string): Promise<void> {
    await super.uninstall(scope, projectDir);
    const mdcPath = join(this.resolveSkillTarget(scope, projectDir), '..', 'agentkey.mdc');
    const existing = await fs.readFile(mdcPath, 'utf8').catch(() => null);
    if (existing === MDC_WRAPPER) {
      await fs.unlink(mdcPath).catch(() => {});
    }
  }
}
