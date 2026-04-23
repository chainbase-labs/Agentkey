import { ensureSource, DEFAULT_REPO_URL, readVersion } from '../source.js';
import { sourceRoot } from '../utils/paths.js';

export async function runUpdate(opts: { repoUrl?: string } = {}): Promise<{ version: string }> {
  await ensureSource(opts.repoUrl ?? DEFAULT_REPO_URL, sourceRoot());
  return { version: await readVersion(sourceRoot()) };
}
