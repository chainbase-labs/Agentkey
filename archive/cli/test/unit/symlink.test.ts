import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSymlink, removeSymlinkIfOurs, copyRecursive } from '../../src/utils/symlink.js';

let dir: string;
beforeEach(async () => { dir = await fs.mkdtemp(join(tmpdir(), 'ak-sl-')); });
afterEach(async () => { await fs.rm(dir, { recursive: true, force: true }); });

describe('symlink', () => {
  it('createSymlink creates a symlink to source', async () => {
    const src = join(dir, 'source'); await fs.mkdir(src);
    await fs.writeFile(join(src, 'f.txt'), 'hello');
    const link = join(dir, 'link');
    await createSymlink(src, link);
    expect(await fs.readFile(join(link, 'f.txt'), 'utf8')).toBe('hello');
  });

  it('createSymlink is idempotent when target already points to source', async () => {
    const src = join(dir, 's'); await fs.mkdir(src);
    const link = join(dir, 'l');
    await createSymlink(src, link);
    await createSymlink(src, link); // should not throw
  });

  it('createSymlink refuses when target exists and is not our symlink', async () => {
    const src = join(dir, 's'); await fs.mkdir(src);
    const link = join(dir, 'l');
    await fs.mkdir(link);
    await expect(createSymlink(src, link)).rejects.toThrow(/already exists/);
  });

  it('removeSymlinkIfOurs only removes symlinks under expectedSourcePrefix', async () => {
    const src = join(dir, 's'); await fs.mkdir(src);
    const link = join(dir, 'l');
    await createSymlink(src, link);
    await removeSymlinkIfOurs(link, dir);
    await expect(fs.stat(link)).rejects.toThrow();
  });

  it('removeSymlinkIfOurs refuses foreign symlinks', async () => {
    const foreign = join(dir, 'foreign'); await fs.mkdir(foreign);
    const link = join(dir, 'l');
    await fs.symlink(foreign, link);
    await expect(removeSymlinkIfOurs(link, join(dir, 'different-prefix'))).rejects.toThrow(/refusing/i);
  });

  it('copyRecursive copies a directory tree', async () => {
    const src = join(dir, 'src'); await fs.mkdir(src);
    await fs.writeFile(join(src, 'a.txt'), 'A');
    await fs.mkdir(join(src, 'sub'));
    await fs.writeFile(join(src, 'sub', 'b.txt'), 'B');
    const dest = join(dir, 'dest');
    await copyRecursive(src, dest);
    expect(await fs.readFile(join(dest, 'a.txt'), 'utf8')).toBe('A');
    expect(await fs.readFile(join(dest, 'sub', 'b.txt'), 'utf8')).toBe('B');
  });
});
