import { buildRegistry } from '../adapters/registry.js';
import { ensureSource, DEFAULT_REPO_URL } from '../source.js';
import { sourceRoot, skillSource } from '../utils/paths.js';
import type { Method, Scope } from '../types.js';

export interface InstallArgs {
  agents: string[];
  scope: Scope;
  method: Method;
  apiKey: string;
  yes: boolean;
  projectDir?: string;
  skipPull?: boolean;
  repoUrl?: string;
  dryRun?: boolean;
}

export interface InstallReport {
  successes: string[];
  failures: { id: string; error: string }[];
  postInstructions: { id: string; text: string }[];
}

export async function runInstall(args: InstallArgs): Promise<InstallReport> {
  if (!args.skipPull) {
    await ensureSource(args.repoUrl ?? DEFAULT_REPO_URL, sourceRoot());
  }
  const registry = buildRegistry();
  const selected = registry.filter(a => args.agents.includes(a.id));

  const report: InstallReport = { successes: [], failures: [], postInstructions: [] };
  if (args.dryRun) return report;

  for (const adapter of selected) {
    try {
      const result = await adapter.install({
        scope: args.scope,
        method: args.method,
        apiKey: args.apiKey,
        sourceDir: skillSource(),
        projectDir: args.projectDir
      });
      report.successes.push(adapter.id);
      if (result.postInstructions) {
        report.postInstructions.push({ id: adapter.id, text: result.postInstructions });
      }
    } catch (err) {
      report.failures.push({ id: adapter.id, error: (err as Error).message });
    }
  }
  return report;
}
