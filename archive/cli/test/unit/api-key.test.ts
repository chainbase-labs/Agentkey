import { describe, it, expect } from 'vitest';
import { resolveApiKey, maskKey } from '../../src/prompts/api-key.js';

describe('api-key', () => {
  it('maskKey keeps prefix and last 4', () => {
    expect(maskKey('sk-abcdefghij')).toBe('sk-*****ghij');
  });
  it('maskKey handles short keys', () => {
    expect(maskKey('abc')).toBe('***');
  });
  it('resolveApiKey prefers explicit arg', async () => {
    const k = await resolveApiKey({ flagKey: 'explicit', env: {}, prompt: async () => 'from-prompt' });
    expect(k).toBe('explicit');
  });
  it('resolveApiKey falls back to env', async () => {
    const k = await resolveApiKey({ flagKey: undefined, env: { AGENTKEY_API_KEY: 'from-env' }, prompt: async () => 'x' });
    expect(k).toBe('from-env');
  });
  it('resolveApiKey prompts when no source', async () => {
    const k = await resolveApiKey({ flagKey: undefined, env: {}, prompt: async () => 'from-prompt' });
    expect(k).toBe('from-prompt');
  });
});
