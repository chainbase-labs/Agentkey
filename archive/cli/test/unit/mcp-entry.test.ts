import { describe, it, expect } from 'vitest';
import { buildEntry, ENTRY_KEY } from '../../src/mcp/entry.js';

describe('mcp entry', () => {
  it('ENTRY_KEY is agentkey', () => {
    expect(ENTRY_KEY).toBe('agentkey');
  });
  it('buildEntry returns standard command shape', () => {
    const e = buildEntry('sk-abcd');
    expect(e).toEqual({
      command: 'npx',
      args: ['-y', '@agentkey/mcp'],
      env: { AGENTKEY_API_KEY: 'sk-abcd' }
    });
  });
});
