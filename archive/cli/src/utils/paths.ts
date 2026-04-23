import { homedir } from 'node:os';
import { join } from 'node:path';
import type { Scope } from '../types.js';

function home(): string {
  return process.env.HOME ?? homedir();
}

export function sourceRoot(): string {
  return join(home(), '.agentkey', 'repo');
}

export function skillSource(): string {
  return join(sourceRoot(), 'skills', 'agentkey');
}

export function resolveScopeRoot(scope: Scope, projectDir: string): string {
  return scope === 'global' ? home() : projectDir;
}

export function logDir(): string {
  return join(home(), '.agentkey', 'logs');
}
