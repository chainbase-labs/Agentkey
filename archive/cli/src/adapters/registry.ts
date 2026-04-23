import type { HostAdapter } from '../types.js';
import { ClaudeCodeAdapter } from './claude-code.js';
import { CursorAdapter } from './cursor.js';
import { CodexAdapter } from './codex.js';
import { GeminiAdapter } from './gemini.js';
import { OpenClawAdapter } from './openclaw.js';
import { HermesAdapter } from './hermes.js';
import { ClaudeDesktopAdapter } from './claude-desktop.js';
import { ManusAdapter } from './manus.js';

export function buildRegistry(home?: string): HostAdapter[] {
  return [
    new ClaudeCodeAdapter(home),
    new CursorAdapter(home),
    new CodexAdapter(home),
    new GeminiAdapter(home),
    new OpenClawAdapter(home),
    new HermesAdapter(home),
    new ClaudeDesktopAdapter(home),
    new ManusAdapter()
  ];
}
