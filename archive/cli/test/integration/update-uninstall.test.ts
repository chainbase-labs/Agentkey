import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInstall } from '../../src/commands/install.js';
import { runUninstall } from '../../src/commands/uninstall.js';

let dir: string; let origHome: string | undefined;
beforeEach(async () => {
  dir = await fs.mkdtemp(join(tmpdir(), 'ak-uu-'));
  origHome = process.env.HOME;
  process.env.HOME = dir;
  const repoDir = join(dir, '.agentkey', 'repo');
  await fs.mkdir(join(repoDir, 'skills', 'agentkey'), { recursive: true });
  await fs.mkdir(join(repoDir, '.git'), { recursive: true });
  await fs.writeFile(join(repoDir, 'version'), '0.3.4\n');
});
afterEach(async () => {
  process.env.HOME = origHome;
  await fs.rm(dir, { recursive: true, force: true });
});

describe('uninstall', () => {
  it('removes symlinks and MCP entries', async () => {
    await runInstall({ agents: ['claude-code'], scope: 'global', method: 'symlink', apiKey: 'sk', yes: true, skipPull: true });
    await runUninstall({ agents: ['claude-code'], scope: 'global' });
    await expect(fs.stat(join(dir, '.claude', 'skills', 'agentkey'))).rejects.toThrow();
    const cfg = JSON.parse(await fs.readFile(join(dir, '.claude.json'), 'utf8'));
    expect(cfg.mcpServers.agentkey).toBeUndefined();
  });

  it('is a no-op when host not installed', async () => {
    await runUninstall({ agents: ['claude-code'], scope: 'global' });
  });
});
