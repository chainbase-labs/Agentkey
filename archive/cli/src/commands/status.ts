import { buildRegistry } from '../adapters/registry.js';
import type { InstallState, Scope } from '../types.js';
import { readVersion } from '../source.js';
import { sourceRoot } from '../utils/paths.js';

export interface StatusEntry {
  id: string;
  displayName: string;
  detected: boolean;
  state: InstallState;
}

export async function runStatus(opts: { scope: Scope; projectDir?: string }): Promise<StatusEntry[]> {
  const reg = buildRegistry();
  const out: StatusEntry[] = [];
  for (const a of reg) {
    const scope = a.supportedScopes.includes(opts.scope) ? opts.scope : a.supportedScopes[0];
    out.push({
      id: a.id,
      displayName: a.displayName,
      detected: await a.detect().catch(() => false),
      state: await a.isAlreadyInstalled(scope, opts.projectDir).catch(() => 'none' as InstallState)
    });
  }
  return out;
}

export async function sourceVersion(): Promise<string> {
  return readVersion(sourceRoot());
}
