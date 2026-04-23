import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { updateFileWithBackup, readIfExists } from '../../src/utils/fs-atomic.js';

let dir: string;
beforeEach(async () => { dir = await fs.mkdtemp(join(tmpdir(), 'ak-')); });
afterEach(async () => { await fs.rm(dir, { recursive: true, force: true }); });

describe('fs-atomic', () => {
  it('readIfExists returns null for missing file', async () => {
    expect(await readIfExists(join(dir, 'nope'))).toBeNull();
  });

  it('updateFileWithBackup creates backup then writes', async () => {
    const file = join(dir, 'c.json');
    await fs.writeFile(file, '{"old":1}');
    await updateFileWithBackup(file, async (orig) => {
      expect(orig).toBe('{"old":1}');
      return '{"new":2}';
    });
    expect(await fs.readFile(file, 'utf8')).toBe('{"new":2}');
    const files = await fs.readdir(dir);
    expect(files.some(f => f.includes('agentkey-backup'))).toBe(true);
  });

  it('rolls back on validation failure', async () => {
    const file = join(dir, 'c.json');
    await fs.writeFile(file, '{"old":1}');
    await expect(updateFileWithBackup(file, async () => 'written', {
      validate: async () => { throw new Error('bad'); }
    })).rejects.toThrow('bad');
    expect(await fs.readFile(file, 'utf8')).toBe('{"old":1}');
  });

  it('creates file if missing (no backup)', async () => {
    const file = join(dir, 'new.json');
    await updateFileWithBackup(file, async (orig) => {
      expect(orig).toBeNull();
      return '{"created":true}';
    });
    expect(await fs.readFile(file, 'utf8')).toBe('{"created":true}');
  });
});
