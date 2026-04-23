import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ClaudeCodeAdapter } from '../../src/adapters/claude-code.js';

let dir: string;
beforeEach(async () => { dir = await fs.mkdtemp(join(tmpdir(), 'ak-cc-')); });
afterEach(async () => { await fs.rm(dir, { recursive: true, force: true }); });

describe('ClaudeCodeAdapter', () => {
  it('detect returns true when ~/.claude exists', async () => {
    await fs.mkdir(join(dir, '.claude'), { recursive: true });
    const a = new ClaudeCodeAdapter(dir);
    expect(await a.detect()).toBe(true);
  });

  it('detect returns false when no claude dir and no binary', async () => {
    const a = new ClaudeCodeAdapter(dir);
    expect(await a.detect()).toBe(false);
  });

  it('returns via-plugin when .claude-plugin marker present', async () => {
    await fs.mkdir(join(dir, '.claude', 'plugins', 'agentkey-skill'), { recursive: true });
    const a = new ClaudeCodeAdapter(dir);
    expect(await a.isAlreadyInstalled('global')).toBe('via-plugin');
  });

  it('resolveSkillTarget uses ~/.claude/skills/agentkey in global scope', () => {
    const a = new ClaudeCodeAdapter(dir);
    expect(a.resolveSkillTarget('global')).toBe(join(dir, '.claude', 'skills', 'agentkey'));
  });

  it('resolveSkillTarget uses ./.claude/skills/agentkey in project scope', () => {
    const a = new ClaudeCodeAdapter(dir);
    expect(a.resolveSkillTarget('project', '/x/y')).toBe('/x/y/.claude/skills/agentkey');
  });
});
