#!/usr/bin/env node
import { cac } from 'cac';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { interactiveInstall } from './prompts/install-flow.js';
import { runInstall } from './commands/install.js';
import { runUpdate } from './commands/update.js';
import { runUninstall } from './commands/uninstall.js';
import { runStatus, sourceVersion } from './commands/status.js';
import type { Method, Scope } from './types.js';

const pkgJson = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'), 'utf8'));
const cli = cac('agentkey');
cli.version(pkgJson.version);
cli.help();

cli.command('install', 'Install AgentKey into selected hosts')
  .option('--agents <list>', 'Comma-separated host ids')
  .option('--scope <scope>', 'global|project', { default: 'global' })
  .option('--method <method>', 'symlink|copy', { default: 'symlink' })
  .option('--api-key <key>', 'AgentKey API key')
  .option('--yes', 'Skip confirmation prompts')
  .option('--dry-run', 'Print summary without making changes')
  .option('--verbose', 'Verbose logging')
  .action(async (opts) => {
    if (!opts.agents) {
      await interactiveInstall();
      return;
    }
    const report = await runInstall({
      agents: (opts.agents as string).split(','),
      scope: opts.scope as Scope,
      method: opts.method as Method,
      apiKey: opts.apiKey ?? process.env.AGENTKEY_API_KEY ?? '',
      yes: !!opts.yes,
      dryRun: !!opts.dryRun
    });
    for (const s of report.successes) console.log(`✓ ${s}`);
    for (const f of report.failures) console.error(`✗ ${f.id}: ${f.error}`);
    for (const pi of report.postInstructions) console.log(`\n[${pi.id}]\n${pi.text}\n`);
    if (report.failures.length) process.exit(1);
  });

cli.command('update', 'Pull latest source and rebuild symlinks').action(async () => {
  const r = await runUpdate();
  console.log(`Updated source to version ${r.version}`);
});

cli.command('uninstall', 'Remove AgentKey from hosts')
  .option('--agents <list>', 'Comma-separated host ids')
  .option('--scope <scope>', 'global|project', { default: 'global' })
  .action(async (opts) => {
    const agents = (opts.agents ?? 'claude-code,cursor,codex,gemini,openclaw,hermes,claude-desktop,manus').split(',');
    const r = await runUninstall({ agents, scope: opts.scope as Scope });
    for (const s of r.successes) console.log(`✓ removed ${s}`);
    for (const f of r.failures) console.error(`✗ ${f.id}: ${f.error}`);
  });

cli.command('status', 'Show installed hosts')
  .option('--scope <scope>', 'global|project', { default: 'global' })
  .action(async (opts) => {
    console.log(`Source: ${await sourceVersion()}`);
    const entries = await runStatus({ scope: opts.scope as Scope });
    for (const e of entries) {
      console.log(`  ${e.displayName.padEnd(18)} detected=${e.detected} state=${e.state}`);
    }
  });

cli.parse();
