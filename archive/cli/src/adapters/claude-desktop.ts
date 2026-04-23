import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { BaseAdapter, type McpFormat } from './base.js';
import type { InstallOpts, Scope } from '../types.js';

export class ClaudeDesktopAdapter extends BaseAdapter {
  id = 'claude-desktop';
  displayName = 'Claude Desktop';
  mode = 'mcp-only' as const;
  supportedScopes: Scope[] = ['global'];
  mcpFormat: McpFormat = 'json';

  private platform: NodeJS.Platform;
  constructor(home?: string, platform?: NodeJS.Platform) {
    super(home);
    this.platform = platform ?? process.platform;
  }

  async detect(): Promise<boolean> {
    const cfg = this.resolveMcpConfigPath('global');
    return fs.stat(dirname(cfg)).then(() => true).catch(() => false);
  }

  resolveSkillTarget(): string | null { return null; }

  resolveMcpConfigPath(_scope: Scope): string {
    if (this.platform === 'darwin') {
      return join(this.home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    }
    if (this.platform === 'win32') {
      const appdata = process.env.APPDATA ?? join(this.home, 'AppData', 'Roaming');
      return join(appdata, 'Claude', 'claude_desktop_config.json');
    }
    return join(this.home, '.config', 'Claude', 'claude_desktop_config.json');
  }

  protected postInstructions(opts: InstallOpts): string {
    return `Claude Desktop has no skills system. Open a Project in Claude Desktop and paste the contents of\n  ${join(opts.sourceDir, 'SKILL.md')}\ninto Project instructions. MCP server is registered and will be available after restarting Claude Desktop.`;
  }
}
