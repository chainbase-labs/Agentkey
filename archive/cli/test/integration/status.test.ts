import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInstall } from '../../src/commands/install.js';
import { runStatus } from '../../src/commands/status.js';

let dir: string; let origHome: string | undefined;
beforeEach(async () => {
  dir = await fs.mkdtemp(join(tmpdir(), 'ak-st-'));
  origHome = process.env.HOME;
  process.env.HOME = dir;
  const r = join(dir, '.agentkey', 'repo');
  await fs.mkdir(join(r, 'skills', 'agentkey'), { recursive: true });
  await fs.mkdir(join(r, '.git'), { recursive: true });
  await fs.writeFile(join(r, 'version'), '0.3.4\n');
});
afterEach(async () => { process.env.HOME = origHome; await fs.rm(dir, { recursive: true, force: true }); });

describe('status', () => {
  it('lists installed hosts', async () => {
    await runInstall({ agents: ['claude-code'], scope: 'global', method: 'symlink', apiKey: 'sk', yes: true, skipPull: true });
    const s = await runStatus({ scope: 'global' });
    const cc = s.find(x => x.id === 'claude-code')!;
    expect(cc.state).toBe('via-cli');
  });

  it('detects TOML host (codex) as via-cli after install', async () => {
    await runInstall({ agents: ['codex'], scope: 'global', method: 'symlink', apiKey: 'sk', yes: true, skipPull: true });
    const s = await runStatus({ scope: 'global' });
    const cx = s.find(x => x.id === 'codex')!;
    expect(cx.state).toBe('via-cli');
  });
});
