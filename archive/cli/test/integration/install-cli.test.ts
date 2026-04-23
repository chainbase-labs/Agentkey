import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInstall } from '../../src/commands/install.js';
import { runUninstall } from '../../src/commands/uninstall.js';
import TOML from '@iarna/toml';

let dir: string;
let origHome: string | undefined;
beforeEach(async () => {
  dir = await fs.mkdtemp(join(tmpdir(), 'ak-cli-'));
  origHome = process.env.HOME;
  process.env.HOME = dir;
});
afterEach(async () => {
  process.env.HOME = origHome;
  await fs.rm(dir, { recursive: true, force: true });
});

describe('runInstall (non-interactive)', () => {
  it('installs to Claude Code and Codex from flags', async () => {
    const repoDir = join(dir, '.agentkey', 'repo');
    await fs.mkdir(join(repoDir, 'skills', 'agentkey'), { recursive: true });
    await fs.writeFile(join(repoDir, 'skills', 'agentkey', 'SKILL.md'), '# AgentKey');
    await fs.writeFile(join(repoDir, 'version'), '0.3.4\n');
    await fs.mkdir(join(repoDir, '.git'), { recursive: true });

    const result = await runInstall({
      agents: ['claude-code', 'codex'],
      scope: 'global',
      method: 'symlink',
      apiKey: 'sk-test',
      yes: true,
      skipPull: true
    });

    expect(result.successes).toEqual(['claude-code', 'codex']);
    expect(result.failures).toEqual([]);
    const ccSkill = join(dir, '.claude', 'skills', 'agentkey');
    expect((await fs.lstat(ccSkill)).isSymbolicLink()).toBe(true);
    const ccMcp = JSON.parse(await fs.readFile(join(dir, '.claude.json'), 'utf8'));
    expect(ccMcp.mcpServers.agentkey.env.AGENTKEY_API_KEY).toBe('sk-test');
  });

  it('running install twice is idempotent', async () => {
    const repoDir = join(dir, '.agentkey', 'repo');
    await fs.mkdir(join(repoDir, 'skills', 'agentkey'), { recursive: true });
    await fs.mkdir(join(repoDir, '.git'), { recursive: true });
    await fs.writeFile(join(repoDir, 'version'), '0.3.4\n');

    const args = { agents: ['claude-code'], scope: 'global' as const, method: 'symlink' as const, apiKey: 'sk', yes: true, skipPull: true };
    await runInstall(args);
    const r2 = await runInstall(args);
    expect(r2.failures).toEqual([]);
  });

  it('reports partial failure without aborting', async () => {
    const repoDir = join(dir, '.agentkey', 'repo');
    await fs.mkdir(join(repoDir, 'skills', 'agentkey'), { recursive: true });
    await fs.mkdir(join(repoDir, '.git'), { recursive: true });

    await fs.mkdir(join(dir, '.claude', 'skills'), { recursive: true });
    await fs.writeFile(join(dir, '.claude', 'skills', 'agentkey'), 'not ours');

    const r = await runInstall({
      agents: ['claude-code', 'codex'],
      scope: 'global', method: 'symlink', apiKey: 'sk', yes: true, skipPull: true
    });

    expect(r.failures.map(f => f.id)).toContain('claude-code');
    expect(r.successes).toContain('codex');
    expect(r.successes).toEqual(['codex']);
    expect(r.failures).toHaveLength(1);
  });

  it('uninstall after copy install removes target dir and MCP entry', async () => {
    const repoDir = join(dir, '.agentkey', 'repo');
    await fs.mkdir(join(repoDir, 'skills', 'agentkey'), { recursive: true });
    await fs.writeFile(join(repoDir, 'skills', 'agentkey', 'SKILL.md'), '# AgentKey');
    await fs.mkdir(join(repoDir, '.git'), { recursive: true });
    await fs.writeFile(join(repoDir, 'version'), '0.3.4\n');

    await runInstall({ agents: ['claude-code'], scope: 'global', method: 'copy', apiKey: 'sk', yes: true, skipPull: true });
    const target = join(dir, '.claude', 'skills', 'agentkey');
    expect((await fs.stat(target)).isDirectory()).toBe(true);

    await runUninstall({ agents: ['claude-code'], scope: 'global' });
    await expect(fs.stat(target)).rejects.toThrow();
    const cfg = JSON.parse(await fs.readFile(join(dir, '.claude.json'), 'utf8'));
    expect(cfg.mcpServers?.agentkey).toBeUndefined();
  });

  it('codex TOML round-trip: install then uninstall', async () => {
    const repoDir = join(dir, '.agentkey', 'repo');
    await fs.mkdir(join(repoDir, 'skills', 'agentkey'), { recursive: true });
    await fs.mkdir(join(repoDir, '.git'), { recursive: true });
    await fs.writeFile(join(repoDir, 'version'), '0.3.4\n');

    await runInstall({ agents: ['codex'], scope: 'global', method: 'symlink', apiKey: 'sk-toml', yes: true, skipPull: true });
    const cfgPath = join(dir, '.codex', 'config.toml');
    const installed = TOML.parse(await fs.readFile(cfgPath, 'utf8')) as any;
    expect(installed.mcp_servers?.agentkey).toBeDefined();

    await runUninstall({ agents: ['codex'], scope: 'global' });
    const after = TOML.parse(await fs.readFile(cfgPath, 'utf8')) as any;
    expect(after.mcp_servers?.agentkey).toBeUndefined();
  });
});
