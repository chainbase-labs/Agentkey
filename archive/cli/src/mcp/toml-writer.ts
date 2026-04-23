import { promises as fs } from 'node:fs';
import TOML from '@iarna/toml';
import { updateFileWithBackup, readIfExists } from '../utils/fs-atomic.js';
import { ENTRY_KEY, buildEntry } from './entry.js';

type TomlShape = { mcp_servers?: Record<string, unknown> };

function safeParse(raw: string, path: string): TomlShape {
  try {
    return TOML.parse(raw) as TomlShape;
  } catch (e) {
    throw new Error(`Failed to parse TOML config at ${path}: ${(e as Error).message}`);
  }
}

export async function hasTomlMcp(path: string): Promise<boolean> {
  const raw = await readIfExists(path);
  if (!raw) return false;
  try {
    const parsed = TOML.parse(raw) as TomlShape;
    return !!parsed.mcp_servers?.[ENTRY_KEY];
  } catch { return false; }
}

export async function writeTomlMcp(path: string, apiKey: string): Promise<void> {
  const desired = buildEntry(apiKey);

  const raw = await readIfExists(path);
  if (raw !== null) {
    try { TOML.parse(raw); }
    catch (parseErr) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      await fs.writeFile(`${path}.agentkey-corrupt-${ts}`, raw);
      throw new Error(`Failed to parse TOML config at ${path}: ${(parseErr as Error).message}`);
    }
    const existing = safeParse(raw, path);
    const entry = existing.mcp_servers?.[ENTRY_KEY];
    if (JSON.stringify(entry) === JSON.stringify(desired)) return;
  }

  await updateFileWithBackup(path, async (orig) => {
    const parsed: TomlShape = orig ? safeParse(orig, path) : {};
    parsed.mcp_servers = parsed.mcp_servers ?? {};
    parsed.mcp_servers[ENTRY_KEY] = desired;
    return TOML.stringify(parsed as any);
  }, {
    validate: async (written) => {
      const reparsed = TOML.parse(written) as TomlShape;
      const entry = reparsed.mcp_servers?.[ENTRY_KEY];
      if (!entry || JSON.stringify(entry) !== JSON.stringify(desired)) {
        throw new Error(`Validation failed: agentkey entry missing or mismatched after write to ${path}`);
      }
    }
  });
}

export async function removeTomlMcp(path: string): Promise<void> {
  const raw = await readIfExists(path);
  if (!raw) return;
  let parsed: TomlShape;
  try { parsed = TOML.parse(raw) as TomlShape; } catch { return; }
  if (!parsed.mcp_servers?.[ENTRY_KEY]) return;
  await updateFileWithBackup(path, async () => {
    delete parsed.mcp_servers![ENTRY_KEY];
    return TOML.stringify(parsed as any);
  });
}
