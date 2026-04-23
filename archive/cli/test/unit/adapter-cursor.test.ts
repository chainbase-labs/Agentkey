import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CursorAdapter, MDC_WRAPPER } from '../../src/adapters/cursor.js';

let dir: string;
beforeEach(async () => { dir = await fs.mkdtemp(join(tmpdir(), 'ak-cur-')); });
afterEach(async () => { await fs.rm(dir, { recursive: true, force: true }); });

describe('CursorAdapter', () => {
  it('install creates rules dir symlink and .mdc wrapper', async () => {
    const source = join(dir, 'src'); await fs.mkdir(source, { recursive: true });
    await fs.writeFile(join(source, 'SKILL.md'), '# AgentKey');
    const home = join(dir, 'home'); await fs.mkdir(home);
    const a = new CursorAdapter(home);
    await a.install({ scope: 'global', method: 'symlink', apiKey: 'k', sourceDir: source });
    const rulesDir = join(home, '.cursor', 'rules', 'agentkey');
    expect((await fs.lstat(rulesDir)).isSymbolicLink()).toBe(true);
    const mdc = await fs.readFile(join(home, '.cursor', 'rules', 'agentkey.mdc'), 'utf8');
    expect(mdc).toMatch(/^---/);
    expect(mdc).toContain('agentkey');
  });

  it('install refuses to overwrite a user-edited .mdc', async () => {
    const source = join(dir, 'src'); await fs.mkdir(source, { recursive: true });
    const home = join(dir, 'home'); await fs.mkdir(home);
    await fs.mkdir(join(home, '.cursor', 'rules'), { recursive: true });
    await fs.writeFile(join(home, '.cursor', 'rules', 'agentkey.mdc'), '# user custom\n');
    const a = new CursorAdapter(home);
    await expect(
      a.install({ scope: 'global', method: 'symlink', apiKey: 'k', sourceDir: source })
    ).rejects.toThrow(/Refusing to overwrite/);
  });

  it('install is idempotent when .mdc matches', async () => {
    const source = join(dir, 'src'); await fs.mkdir(source, { recursive: true });
    const home = join(dir, 'home'); await fs.mkdir(home);
    await fs.mkdir(join(home, '.cursor', 'rules'), { recursive: true });
    await fs.writeFile(join(home, '.cursor', 'rules', 'agentkey.mdc'), MDC_WRAPPER);
    const a = new CursorAdapter(home);
    await a.install({ scope: 'global', method: 'symlink', apiKey: 'k', sourceDir: source });
    expect(await fs.readFile(join(home, '.cursor', 'rules', 'agentkey.mdc'), 'utf8')).toBe(MDC_WRAPPER);
  });

  it('uninstall leaves a user-edited .mdc in place', async () => {
    const source = join(dir, 'src'); await fs.mkdir(source, { recursive: true });
    const home = join(dir, 'home'); await fs.mkdir(home);
    const a = new CursorAdapter(home);
    await a.install({ scope: 'global', method: 'copy', apiKey: 'k', sourceDir: source });
    const mdcPath = join(home, '.cursor', 'rules', 'agentkey.mdc');
    await fs.writeFile(mdcPath, '# user override\n');
    await a.uninstall('global');
    expect(await fs.readFile(mdcPath, 'utf8')).toBe('# user override\n');
  });
});
