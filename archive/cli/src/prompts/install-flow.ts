import * as p from '@clack/prompts';
import { buildRegistry } from '../adapters/registry.js';
import { runInstall } from '../commands/install.js';
import { resolveApiKey, maskKey } from './api-key.js';
import { canSymlink, isWindows } from '../utils/platform.js';
import { readVersion } from '../source.js';
import { sourceRoot } from '../utils/paths.js';
import type { Method, Scope } from '../types.js';

export async function interactiveInstall(): Promise<void> {
  p.intro('AgentKey Installer');

  const version = await readVersion(sourceRoot());
  p.log.info(`Source version: ${version}`);

  const registry = buildRegistry();
  const detections = await Promise.all(registry.map(async a => ({
    id: a.id,
    displayName: a.displayName,
    mode: a.mode,
    detected: await a.detect().catch(() => false),
    state: await a.isAlreadyInstalled('global').catch(() => 'none' as const)
  })));

  const options = detections.map(d => ({
    value: d.id,
    label: d.displayName,
    hint: d.state === 'via-plugin'
      ? 'installed via plugin, skip'
      : (d.detected ? 'detected' : 'not detected — install anyway')
  }));

  const agents = await p.multiselect({
    message: 'Which agents do you want to install to?',
    options,
    initialValues: detections.filter(d => d.detected && d.state !== 'via-plugin').map(d => d.id),
    required: true
  });
  if (p.isCancel(agents)) { p.cancel('Cancelled'); process.exit(1); }

  const scopeOptions: Array<{ value: Scope; label: string; hint?: string }> = [
    { value: 'global', label: 'Global', hint: '~/.claude/, ~/.cursor/, …' },
    { value: 'project', label: 'Project', hint: './.claude/, ./.cursor/, …' }
  ];
  const scope = await p.select({
    message: 'Installation scope',
    options: scopeOptions,
    initialValue: 'global' as Scope
  }) as Scope;
  if (p.isCancel(scope)) { p.cancel('Cancelled'); process.exit(1); }

  const symlinkOk = !isWindows() || await canSymlink();
  const methodOptions: Array<{ value: Method; label: string; hint?: string }> = [
    { value: 'symlink', label: 'Symlink (Recommended — live updates)', hint: symlinkOk ? '' : 'unavailable on this system' },
    { value: 'copy', label: 'Copy', hint: 'Windows without Developer Mode' }
  ];
  const method = await p.select({
    message: 'Installation method',
    options: methodOptions,
    initialValue: (symlinkOk ? 'symlink' : 'copy') as Method
  }) as Method;
  if (p.isCancel(method)) { p.cancel('Cancelled'); process.exit(1); }

  const apiKey = await resolveApiKey({
    flagKey: undefined,
    env: process.env,
    prompt: async () => {
      const v = await p.password({ message: 'AgentKey API key (get one at console.agentkey.app):' });
      if (p.isCancel(v) || !v) { p.cancel('Cancelled'); process.exit(1); }
      return v;
    }
  });

  p.log.info(`API key: ${maskKey(apiKey)}`);

  const confirm = await p.confirm({ message: 'Proceed with installation?', initialValue: true });
  if (p.isCancel(confirm) || !confirm) { p.cancel('Cancelled'); process.exit(0); }

  const spinner = p.spinner();
  spinner.start('Installing…');
  const report = await runInstall({
    agents: agents as string[],
    scope, method, apiKey, yes: true
  });
  spinner.stop('Installation finished');

  for (const s of report.successes) p.log.success(`✓ ${s}`);
  for (const f of report.failures) p.log.error(`✗ ${f.id}: ${f.error}`);
  for (const pi of report.postInstructions) {
    p.log.message(`\n[${pi.id}]\n${pi.text}`);
  }

  p.outro('Done. Restart each agent to pick up the skill.');
}
