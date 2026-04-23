import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeJsonMcp, removeJsonMcp, hasJsonMcp } from '../../src/mcp/json-writer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIX = join(__dirname, '..', 'fixtures', 'mcp-json');

async function copyFixture(name: string, dest: string) {
  await fs.copyFile(join(FIX, name), dest);
}

let dir: string;
beforeEach(async () => { dir = await fs.mkdtemp(join(tmpdir(), 'ak-jw-')); });
afterEach(async () => { await fs.rm(dir, { recursive: true, force: true }); });

describe('json-writer', () => {
  it('writes agentkey into empty config', async () => {
    const file = join(dir, 'c.json');
    await copyFixture('empty.json', file);
    await writeJsonMcp(file, 'sk-1');
    const parsed = JSON.parse(await fs.readFile(file, 'utf8'));
    expect(parsed.mcpServers.agentkey.env.AGENTKEY_API_KEY).toBe('sk-1');
  });

  it('preserves other entries', async () => {
    const file = join(dir, 'c.json');
    await copyFixture('with-others.json', file);
    await writeJsonMcp(file, 'sk-2');
    const parsed = JSON.parse(await fs.readFile(file, 'utf8'));
    expect(parsed.mcpServers.other).toBeDefined();
    expect(parsed.mcpServers.agentkey).toBeDefined();
  });

  it('overwrites existing agentkey key and backs up', async () => {
    const file = join(dir, 'c.json');
    await copyFixture('with-agentkey.json', file);
    await writeJsonMcp(file, 'sk-new');
    const parsed = JSON.parse(await fs.readFile(file, 'utf8'));
    expect(parsed.mcpServers.agentkey.env.AGENTKEY_API_KEY).toBe('sk-new');
    const files = await fs.readdir(dir);
    expect(files.some(f => f.includes('agentkey-backup'))).toBe(true);
  });

  it('skips if entry already identical', async () => {
    const file = join(dir, 'c.json');
    await copyFixture('with-agentkey.json', file);
    await writeJsonMcp(file, 'old');
    const files = await fs.readdir(dir);
    expect(files.filter(f => f.includes('backup'))).toHaveLength(0);
  });

  it('hasJsonMcp detects presence', async () => {
    const file = join(dir, 'c.json');
    await copyFixture('with-agentkey.json', file);
    expect(await hasJsonMcp(file)).toBe(true);
  });

  it('removeJsonMcp removes only agentkey', async () => {
    const file = join(dir, 'c.json');
    await copyFixture('with-agentkey.json', file);
    await removeJsonMcp(file);
    const parsed = JSON.parse(await fs.readFile(file, 'utf8'));
    expect(parsed.mcpServers.agentkey).toBeUndefined();
  });

  it('createsOrFile when missing', async () => {
    const file = join(dir, 'new.json');
    await writeJsonMcp(file, 'sk-x');
    const parsed = JSON.parse(await fs.readFile(file, 'utf8'));
    expect(parsed.mcpServers.agentkey.env.AGENTKEY_API_KEY).toBe('sk-x');
  });

  it('preserves 4-space indent and absence of trailing newline', async () => {
    const file = join(dir, 'c.json');
    const orig = JSON.stringify({ mcpServers: { other: { command: 'foo' } } }, null, 4);
    await fs.writeFile(file, orig); // no trailing newline
    await writeJsonMcp(file, 'sk-fmt');
    const written = await fs.readFile(file, 'utf8');
    expect(written.endsWith('\n')).toBe(false);
    expect(written).toMatch(/\n {4}"mcpServers"/);
  });

  it('throws on corrupt JSON and leaves backup', async () => {
    const file = join(dir, 'c.json');
    await fs.writeFile(file, '{ not json');
    await expect(writeJsonMcp(file, 'sk-x')).rejects.toThrow(/parse/i);
    const files = await fs.readdir(dir);
    expect(files.some(f => f.includes('agentkey-corrupt'))).toBe(true);
  });
});
