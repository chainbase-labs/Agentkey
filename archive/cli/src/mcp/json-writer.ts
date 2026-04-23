import { promises as fs } from 'node:fs';
import { updateFileWithBackup, readIfExists } from '../utils/fs-atomic.js';
import { ENTRY_KEY, buildEntry } from './entry.js';

type ConfigShape = { mcpServers?: Record<string, unknown> };

function detectIndent(raw: string): string | number {
  if (/\n\t+"/.test(raw)) return '\t';
  const m = raw.match(/\n( +)"/);
  if (m) return m[1].length;
  return 2;
}

function detectTrailingNewline(raw: string): boolean {
  return raw.endsWith('\n');
}

function serialize(parsed: unknown, indent: string | number, trailingNewline: boolean): string {
  return JSON.stringify(parsed, null, indent) + (trailingNewline ? '\n' : '');
}

export async function hasJsonMcp(path: string): Promise<boolean> {
  const raw = await readIfExists(path);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as ConfigShape;
    return !!parsed.mcpServers?.[ENTRY_KEY];
  } catch { return false; }
}

export async function writeJsonMcp(path: string, apiKey: string): Promise<void> {
  const desired = buildEntry(apiKey);

  const raw = await readIfExists(path);
  let parsedExisting: ConfigShape | null = null;
  const indent: string | number = raw !== null ? detectIndent(raw) : 2;
  const trailingNewline = raw !== null ? detectTrailingNewline(raw) : true;

  if (raw !== null) {
    try {
      const v = JSON.parse(raw);
      parsedExisting = typeof v === 'object' && v !== null ? v : {};
    } catch (parseErr) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      await fs.writeFile(`${path}.agentkey-corrupt-${ts}`, raw);
      throw new Error(`Failed to parse JSON config at ${path}: ${(parseErr as Error).message}`);
    }

    const entry = parsedExisting!.mcpServers?.[ENTRY_KEY];
    if (JSON.stringify(entry) === JSON.stringify(desired)) return;
  }

  await updateFileWithBackup(path, async () => {
    const parsed: ConfigShape = parsedExisting ?? {};
    parsed.mcpServers = parsed.mcpServers ?? {};
    parsed.mcpServers[ENTRY_KEY] = desired;
    return serialize(parsed, indent, trailingNewline);
  }, {
    validate: async (written) => {
      const reparsed = JSON.parse(written) as ConfigShape;
      const entry = reparsed.mcpServers?.[ENTRY_KEY];
      if (!entry || JSON.stringify(entry) !== JSON.stringify(desired)) {
        throw new Error(`Validation failed: agentkey entry missing or mismatched after write to ${path}`);
      }
    }
  });
}

export async function removeJsonMcp(path: string): Promise<void> {
  const raw = await readIfExists(path);
  if (!raw) return;
  let parsed: ConfigShape;
  try { parsed = JSON.parse(raw) as ConfigShape; } catch { return; }
  if (!parsed.mcpServers?.[ENTRY_KEY]) return;
  const indent = detectIndent(raw);
  const trailingNewline = detectTrailingNewline(raw);
  await updateFileWithBackup(path, async () => {
    delete parsed.mcpServers![ENTRY_KEY];
    return serialize(parsed, indent, trailingNewline);
  });
}
