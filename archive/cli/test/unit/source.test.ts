import { describe, it, expect, vi, beforeEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ensureSource, readVersion } from '../../src/source.js';

const mockGit = { clone: vi.fn(), pull: vi.fn() };
vi.mock('simple-git', () => ({ simpleGit: () => mockGit }));

let dir: string;
beforeEach(async () => {
  dir = await fs.mkdtemp(join(tmpdir(), 'ak-src-'));
  mockGit.clone.mockReset();
  mockGit.pull.mockReset();
});

describe('source', () => {
  it('ensureSource clones when repo missing', async () => {
    mockGit.clone.mockImplementation(async (_u: string, dest: string) => {
      await fs.mkdir(dest, { recursive: true });
      await fs.writeFile(join(dest, 'version'), '0.3.4\n');
    });
    const repo = join(dir, 'repo');
    await ensureSource('https://example/repo.git', repo);
    expect(mockGit.clone).toHaveBeenCalledOnce();
    expect(mockGit.pull).not.toHaveBeenCalled();
  });

  it('ensureSource pulls when repo exists', async () => {
    const repo = join(dir, 'repo');
    await fs.mkdir(join(repo, '.git'), { recursive: true });
    await fs.writeFile(join(repo, 'version'), '0.3.4\n');
    mockGit.pull.mockResolvedValue({ summary: {} });
    await ensureSource('https://example/repo.git', repo);
    expect(mockGit.pull).toHaveBeenCalledOnce();
  });

  it('ensureSource warns (not throws) when pull fails on existing repo', async () => {
    const repo = join(dir, 'repo');
    await fs.mkdir(join(repo, '.git'), { recursive: true });
    mockGit.pull.mockRejectedValue(new Error('network down'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(ensureSource('https://example/repo.git', repo)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('readVersion returns trimmed version', async () => {
    await fs.writeFile(join(dir, 'version'), '1.2.3\n');
    expect(await readVersion(dir)).toBe('1.2.3');
  });

  it('readVersion returns unknown when file missing', async () => {
    expect(await readVersion(join(dir, 'nope'))).toBe('unknown');
  });
});
