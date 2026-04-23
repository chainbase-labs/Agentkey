import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { simpleGit } from 'simple-git';
import { readIfExists } from './utils/fs-atomic.js';

export const DEFAULT_REPO_URL = 'https://github.com/chainbase-labs/AgentKey-Skill.git';

export async function ensureSource(url: string, repoDir: string): Promise<void> {
  const gitDirExists = await fs.stat(join(repoDir, '.git')).then(() => true).catch(() => false);
  const git = simpleGit();
  if (!gitDirExists) {
    await fs.mkdir(dirname(repoDir), { recursive: true });
    await git.clone(url, repoDir);
    return;
  }
  try {
    await simpleGit(repoDir).pull();
  } catch (err) {
    console.warn(`agentkey: git pull failed, using stale source at ${repoDir}: ${(err as Error).message}`);
  }
}

export async function readVersion(repoDir: string): Promise<string> {
  const raw = await readIfExists(join(repoDir, 'version'));
  return raw ? raw.trim() : 'unknown';
}
