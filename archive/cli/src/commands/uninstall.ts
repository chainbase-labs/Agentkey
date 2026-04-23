import { buildRegistry } from '../adapters/registry.js';
import type { Scope } from '../types.js';

export interface UninstallArgs {
  agents: string[];
  scope: Scope;
  projectDir?: string;
}

export async function runUninstall(args: UninstallArgs): Promise<{ successes: string[]; failures: { id: string; error: string }[] }> {
  const registry = buildRegistry();
  const selected = registry.filter(a => args.agents.includes(a.id));
  const successes: string[] = [];
  const failures: { id: string; error: string }[] = [];
  for (const adapter of selected) {
    try {
      await adapter.uninstall(args.scope, args.projectDir);
      successes.push(adapter.id);
    } catch (err) {
      failures.push({ id: adapter.id, error: (err as Error).message });
    }
  }
  return { successes, failures };
}
