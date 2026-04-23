import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function isWindows(): boolean {
  return process.platform === 'win32';
}

/**
 * On Windows, symlink creation silently works only with Developer Mode on or admin.
 * We probe by actually creating a symlink in a tmp dir.
 */
export async function canSymlink(): Promise<boolean> {
  const probeDir = await fs.mkdtemp(join(tmpdir(), 'agentkey-probe-'));
  const target = join(probeDir, 'target.txt');
  const link = join(probeDir, 'link.txt');
  try {
    await fs.writeFile(target, 'x');
    await fs.symlink(target, link);
    return true;
  } catch {
    return false;
  } finally {
    await fs.rm(probeDir, { recursive: true, force: true });
  }
}
