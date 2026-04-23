import { describe, it, expect } from 'vitest';
import { ManusAdapter } from '../../src/adapters/manus.js';

describe('ManusAdapter', () => {
  it('install does not touch filesystem and returns snippet', async () => {
    const a = new ManusAdapter();
    const r = await a.install({ scope: 'global', method: 'symlink', apiKey: 'sk', sourceDir: '/src' });
    expect(r.postInstructions).toContain('AGENTKEY_API_KEY');
    expect(r.postInstructions).toContain('manus');
    expect(r.postInstructions).toContain('/src/SKILL.md');
  });

  it('uninstall is a no-op', async () => {
    const a = new ManusAdapter();
    await a.uninstall('global');
  });

  it('supported scopes is global only', () => {
    expect(new ManusAdapter().supportedScopes).toEqual(['global']);
  });
});
