import { describe, it, expect } from 'vitest';
import { buildRegistry } from '../../src/adapters/registry.js';

describe('registry', () => {
  it('includes all 8 hosts in stable order', () => {
    const reg = buildRegistry();
    expect(reg.map(a => a.id)).toEqual([
      'claude-code', 'cursor', 'codex', 'gemini',
      'openclaw', 'hermes', 'claude-desktop', 'manus'
    ]);
  });
  it('by default targets homedir', () => {
    expect(buildRegistry()[0].id).toBe('claude-code');
  });
});
