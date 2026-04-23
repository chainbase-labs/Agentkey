import { describe, it, expect } from 'vitest';
import type { Scope, Method, Mode, InstallState, HostAdapter } from '../../src/types.js';

describe('types', () => {
  it('Scope accepts global and project', () => {
    const s: Scope[] = ['global', 'project'];
    expect(s).toHaveLength(2);
  });
  it('Mode has three variants', () => {
    const m: Mode[] = ['full', 'mcp-only', 'snippet'];
    expect(m).toHaveLength(3);
  });
});
