import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';

export async function createSymlink(source: string, target: string): Promise<void> {
  await fs.mkdir(dirname(target), { recursive: true });
  const lstat = await fs.lstat(target).catch(() => null);
  if (lstat) {
    if (lstat.isSymbolicLink()) {
      const existing = await fs.readlink(target);
      if (resolve(dirname(target), existing) === resolve(source)) return;
    }
    throw new Error(`Target already exists and is not our symlink: ${target}`);
  }
  const type = (await fs.stat(source)).isDirectory() ? 'dir' : 'file';
  await fs.symlink(source, target, type);
}

export async function removeSymlinkIfOurs(target: string, expectedSourcePrefix: string): Promise<void> {
  const lstat = await fs.lstat(target).catch(() => null);
  if (!lstat) return;
  if (!lstat.isSymbolicLink()) {
    throw new Error(`Refusing to remove non-symlink: ${target}`);
  }
  const dest = await fs.readlink(target);
  const resolved = resolve(dirname(target), dest);
  if (!resolved.startsWith(resolve(expectedSourcePrefix))) {
    throw new Error(`Refusing to remove symlink not pointing into ${expectedSourcePrefix}: ${target} -> ${resolved}`);
  }
  await fs.unlink(target);
}

export async function copyRecursive(source: string, target: string): Promise<void> {
  await fs.cp(source, target, { recursive: true });
}
