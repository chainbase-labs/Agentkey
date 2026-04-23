import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import TOML from '@iarna/toml';
import { CodexAdapter } from '../../src/adapters/codex.js';
import { GeminiAdapter } from '../../src/adapters/gemini.js';
import { OpenClawAdapter } from '../../src/adapters/openclaw.js';
import { HermesAdapter } from '../../src/adapters/hermes.js';

let dir: string;
beforeEach(async () => { dir = await fs.mkdtemp(join(tmpdir(), 'ak-rest-')); });
afterEach(async () => { await fs.rm(dir, { recursive: true, force: true }); });

async function prepSource() {
  const s = join(dir, 'src'); await fs.mkdir(s, { recursive: true });
  await fs.writeFile(join(s, 'SKILL.md'), 'x');
  return s;
}

describe('Codex adapter', () => {
  it('installs TOML config', async () => {
    const source = await prepSource();
    const home = join(dir, 'home'); await fs.mkdir(home);
    const a = new CodexAdapter(home);
    await a.install({ scope: 'global', method: 'symlink', apiKey: 'sk', sourceDir: source });
    const parsed = TOML.parse(await fs.readFile(join(home, '.codex', 'config.toml'), 'utf8')) as any;
    expect(parsed.mcp_servers.agentkey.env.AGENTKEY_API_KEY).toBe('sk');
    expect((await fs.lstat(join(home, '.codex', 'skills', 'agentkey'))).isSymbolicLink()).toBe(true);
  });
});

describe('Gemini adapter', () => {
  it('installs settings.json', async () => {
    const source = await prepSource();
    const home = join(dir, 'home'); await fs.mkdir(home);
    const a = new GeminiAdapter(home);
    await a.install({ scope: 'global', method: 'symlink', apiKey: 'sk', sourceDir: source });
    const parsed = JSON.parse(await fs.readFile(join(home, '.gemini', 'settings.json'), 'utf8'));
    expect(parsed.mcpServers.agentkey.env.AGENTKEY_API_KEY).toBe('sk');
  });
});

describe('OpenClaw adapter', () => {
  it('installs config.json + skill symlink', async () => {
    const source = await prepSource();
    const home = join(dir, 'home'); await fs.mkdir(home);
    const a = new OpenClawAdapter(home);
    await a.install({ scope: 'global', method: 'symlink', apiKey: 'sk', sourceDir: source });
    expect((await fs.lstat(join(home, '.openclaw', 'skills', 'agentkey'))).isSymbolicLink()).toBe(true);
  });
});

describe('Hermes adapter', () => {
  it('installs config.json + skill symlink', async () => {
    const source = await prepSource();
    const home = join(dir, 'home'); await fs.mkdir(home);
    const a = new HermesAdapter(home);
    await a.install({ scope: 'global', method: 'symlink', apiKey: 'sk', sourceDir: source });
    expect((await fs.lstat(join(home, '.hermes', 'skills', 'agentkey'))).isSymbolicLink()).toBe(true);
  });
});
