import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import TOML from '@iarna/toml';
import { writeTomlMcp, removeTomlMcp } from '../../src/mcp/toml-writer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIX = join(__dirname, '..', 'fixtures', 'mcp-toml');

let dir: string;
beforeEach(async () => { dir = await fs.mkdtemp(join(tmpdir(), 'ak-tw-')); });
afterEach(async () => { await fs.rm(dir, { recursive: true, force: true }); });

describe('toml-writer', () => {
  it('adds agentkey section to empty file', async () => {
    const file = join(dir, 'c.toml');
    await fs.copyFile(join(FIX, 'empty.toml'), file);
    await writeTomlMcp(file, 'sk-1');
    const parsed = TOML.parse(await fs.readFile(file, 'utf8')) as any;
    expect(parsed.mcp_servers.agentkey.env.AGENTKEY_API_KEY).toBe('sk-1');
  });

  it('preserves other entries', async () => {
    const file = join(dir, 'c.toml');
    await fs.copyFile(join(FIX, 'with-others.toml'), file);
    await writeTomlMcp(file, 'sk-2');
    const parsed = TOML.parse(await fs.readFile(file, 'utf8')) as any;
    expect(parsed.mcp_servers.other).toBeDefined();
    expect(parsed.mcp_servers.agentkey).toBeDefined();
  });

  it('overwrites existing agentkey and backs up', async () => {
    const file = join(dir, 'c.toml');
    await fs.copyFile(join(FIX, 'with-agentkey.toml'), file);
    await writeTomlMcp(file, 'sk-new');
    const parsed = TOML.parse(await fs.readFile(file, 'utf8')) as any;
    expect(parsed.mcp_servers.agentkey.env.AGENTKEY_API_KEY).toBe('sk-new');
    expect((await fs.readdir(dir)).some(f => f.includes('backup'))).toBe(true);
  });

  it('skips if entry already identical', async () => {
    const file = join(dir, 'c.toml');
    await fs.copyFile(join(FIX, 'with-agentkey.toml'), file);
    // first write to normalize the entry
    await writeTomlMcp(file, 'same-key');
    // purge backups made during the normalization write
    for (const f of await fs.readdir(dir)) {
      if (f.includes('backup')) await fs.rm(join(dir, f));
    }
    await writeTomlMcp(file, 'same-key');
    const remaining = await fs.readdir(dir);
    expect(remaining.some(f => f.includes('backup'))).toBe(false);
  });

  it('throws on corrupt TOML and leaves quarantine file', async () => {
    const file = join(dir, 'c.toml');
    await fs.writeFile(file, 'not valid toml = [[[');
    await expect(writeTomlMcp(file, 'sk')).rejects.toThrow(/parse/i);
    const entries = await fs.readdir(dir);
    expect(entries.some(f => f.includes('agentkey-corrupt'))).toBe(true);
  });

  it('removeTomlMcp deletes only agentkey', async () => {
    const file = join(dir, 'c.toml');
    await fs.copyFile(join(FIX, 'with-agentkey.toml'), file);
    await removeTomlMcp(file);
    const parsed = TOML.parse(await fs.readFile(file, 'utf8')) as any;
    expect(parsed.mcp_servers?.agentkey).toBeUndefined();
  });
});
