import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ClaudeDesktopAdapter } from '../../src/adapters/claude-desktop.js';

let dir: string;
beforeEach(async () => { dir = await fs.mkdtemp(join(tmpdir(), 'ak-cd-')); });
afterEach(async () => { await fs.rm(dir, { recursive: true, force: true }); });

describe('ClaudeDesktopAdapter', () => {
  it('install writes MCP config and returns postInstructions', async () => {
    const source = join(dir, 'src'); await fs.mkdir(source, { recursive: true });
    const home = join(dir, 'home'); await fs.mkdir(home);
    const a = new ClaudeDesktopAdapter(home, 'darwin');
    const r = await a.install({ scope: 'global', method: 'symlink', apiKey: 'sk', sourceDir: source });
    const cfgPath = join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    const parsed = JSON.parse(await fs.readFile(cfgPath, 'utf8'));
    expect(parsed.mcpServers.agentkey.env.AGENTKEY_API_KEY).toBe('sk');
    expect(r.postInstructions).toContain('Project instructions');
    expect(r.postInstructions).toContain('SKILL.md');
  });

  it('does not create skill symlink', async () => {
    const source = join(dir, 'src'); await fs.mkdir(source, { recursive: true });
    const home = join(dir, 'home'); await fs.mkdir(home);
    const a = new ClaudeDesktopAdapter(home, 'darwin');
    await a.install({ scope: 'global', method: 'symlink', apiKey: 'sk', sourceDir: source });
    const skillsDir = join(home, 'Library', 'Application Support', 'Claude', 'skills');
    await expect(fs.stat(skillsDir)).rejects.toThrow();
  });

  it('supported scopes is global only', () => {
    const a = new ClaudeDesktopAdapter(dir, 'darwin');
    expect(a.supportedScopes).toEqual(['global']);
  });

  it('detect returns true when parent dir exists', async () => {
    const home = join(dir, 'home');
    await fs.mkdir(join(home, 'Library', 'Application Support', 'Claude'), { recursive: true });
    const a = new ClaudeDesktopAdapter(home, 'darwin');
    expect(await a.detect()).toBe(true);
  });

  it('detect returns false when parent dir missing', async () => {
    const home = join(dir, 'home2');
    await fs.mkdir(home);
    const a = new ClaudeDesktopAdapter(home, 'darwin');
    expect(await a.detect()).toBe(false);
  });
});
