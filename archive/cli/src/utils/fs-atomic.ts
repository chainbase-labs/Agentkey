import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';

export async function readIfExists(path: string): Promise<string | null> {
  try {
    return await fs.readFile(path, 'utf8');
  } catch (e: any) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

export interface UpdateOpts {
  validate?: (written: string) => Promise<void>;
  backupSuffix?: string;
}

export async function updateFileWithBackup(
  path: string,
  mutate: (original: string | null) => Promise<string>,
  opts: UpdateOpts = {}
): Promise<void> {
  const original = await readIfExists(path);
  const next = await mutate(original);

  await fs.mkdir(dirname(path), { recursive: true });

  let backupPath: string | null = null;
  if (original !== null) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const suffix = opts.backupSuffix ?? 'agentkey-backup';
    backupPath = `${path}.${suffix}-${ts}`;
    await fs.writeFile(backupPath, original);
  }

  try {
    await fs.writeFile(path, next);
    if (opts.validate) await opts.validate(next);
  } catch (err) {
    if (backupPath && original !== null) {
      await fs.writeFile(path, original).catch(() => {});
    }
    throw err;
  }
}
