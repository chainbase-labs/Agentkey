import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BaseAdapter } from '../../src/adapters/base.js';
import type { Scope } from '../../src/types.js';

class FakeFullAdapter extends BaseAdapter {
  id = 'fake'; displayName = 'Fake'; mode = 'full' as const;
  supportedScopes: Scope[] = ['global', 'project'];
  mcpFormat = 'json' as const;
  private _sourcePrefix: string;
  constructor(home: string, sourcePrefix: string) {
    super(home);
    this._sourcePrefix = sourcePrefix;
  }
  async detect() { return true; }
  resolveSkillTarget(scope: Scope, projectDir?: string) {
    return join(scope === 'global' ? this.home : projectDir!, 'fake', 'skills', 'agentkey');
  }
  resolveMcpConfigPath(scope: Scope, projectDir?: string) {
    return join(scope === 'global' ? this.home : projectDir!, 'fake', 'mcp.json');
  }
  protected symlinkSourcePrefix(): string { return this._sourcePrefix; }
}

let dir: string;
beforeEach(async () => {
  dir = await fs.mkdtemp(join(tmpdir(), 'ak-ba-'));
});
afterEach(async () => { await fs.rm(dir, { recursive: true, force: true }); });

describe('BaseAdapter', () => {
  it('install creates symlink and writes MCP', async () => {
    const source = join(dir, 'src'); await fs.mkdir(source, { recursive: true });
    const home = join(dir, 'home'); await fs.mkdir(home);
    const a = new FakeFullAdapter(home, source);
    await a.install({ scope: 'global', method: 'symlink', apiKey: 'sk-1', sourceDir: source });
    const linkTarget = join(home, 'fake', 'skills', 'agentkey');
    expect((await fs.lstat(linkTarget)).isSymbolicLink()).toBe(true);
    const cfg = JSON.parse(await fs.readFile(join(home, 'fake', 'mcp.json'), 'utf8'));
    expect(cfg.mcpServers.agentkey.env.AGENTKEY_API_KEY).toBe('sk-1');
  });

  it('uninstall removes symlink and MCP entry', async () => {
    const source = join(dir, 'src'); await fs.mkdir(source, { recursive: true });
    const home = join(dir, 'home'); await fs.mkdir(home);
    const a = new FakeFullAdapter(home, source);
    await a.install({ scope: 'global', method: 'symlink', apiKey: 'sk-1', sourceDir: source });
    await a.uninstall('global');
    await expect(fs.stat(join(home, 'fake', 'skills', 'agentkey'))).rejects.toThrow();
    const cfg = JSON.parse(await fs.readFile(join(home, 'fake', 'mcp.json'), 'utf8'));
    expect(cfg.mcpServers.agentkey).toBeUndefined();
  });

  it('install+uninstall via copy succeeds (marker present)', async () => {
    const source = join(dir, 'src'); await fs.mkdir(source, { recursive: true });
    await fs.writeFile(join(source, 'SKILL.md'), '# hi');
    const home = join(dir, 'home'); await fs.mkdir(home);
    const a = new FakeFullAdapter(home, source);
    await a.install({ scope: 'global', method: 'copy', apiKey: 'sk', sourceDir: source });
    const target = join(home, 'fake', 'skills', 'agentkey');
    expect(await fs.readFile(join(target, '.agentkey-install.json'), 'utf8')).toContain('agentkey-cli');
    await a.uninstall('global');
    await expect(fs.stat(target)).rejects.toThrow();
  });

  it('uninstall refuses to delete non-symlink directory without marker', async () => {
    const source = join(dir, 'src'); await fs.mkdir(source, { recursive: true });
    const home = join(dir, 'home'); await fs.mkdir(home);
    const a = new FakeFullAdapter(home, source);
    const target = join(home, 'fake', 'skills', 'agentkey');
    await fs.mkdir(target, { recursive: true });
    await fs.writeFile(join(target, 'user-content.md'), 'hand-authored');
    await expect(a.uninstall('global')).rejects.toThrow(/refusing|marker/i);
    expect(await fs.readFile(join(target, 'user-content.md'), 'utf8')).toBe('hand-authored');
  });

  it('isAlreadyInstalled detects TOML entry', async () => {
    class TomlAdapter extends BaseAdapter {
      id = 'tml'; displayName = 'Tml'; mode = 'mcp-only' as const;
      supportedScopes: Scope[] = ['global'];
      mcpFormat = 'toml' as const;
      async detect() { return true; }
      resolveMcpConfigPath(_scope: Scope) { return join(this.home, 'cfg.toml'); }
    }
    const home = join(dir, 'home'); await fs.mkdir(home);
    await fs.writeFile(join(home, 'cfg.toml'), `[mcp_servers.agentkey]\ncommand = "x"\n`);
    const a = new TomlAdapter(home);
    expect(await a.isAlreadyInstalled('global')).toBe('via-cli');
  });

  it('uses copy when method=copy', async () => {
    const source = join(dir, 'src'); await fs.mkdir(source, { recursive: true });
    await fs.writeFile(join(source, 'SKILL.md'), '# hi');
    const home = join(dir, 'home'); await fs.mkdir(home);
    const a = new FakeFullAdapter(home, source);
    await a.install({ scope: 'global', method: 'copy', apiKey: 'sk', sourceDir: source });
    const target = join(home, 'fake', 'skills', 'agentkey');
    expect((await fs.lstat(target)).isSymbolicLink()).toBe(false);
    expect(await fs.readFile(join(target, 'SKILL.md'), 'utf8')).toBe('# hi');
  });
});
