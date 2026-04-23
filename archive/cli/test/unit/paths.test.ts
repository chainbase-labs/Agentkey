import { describe, it, expect } from 'vitest';
import { resolveScopeRoot, sourceRoot } from '../../src/utils/paths.js';
import { homedir } from 'node:os';
import { join } from 'node:path';

describe('paths', () => {
  it('resolveScopeRoot global returns home', () => {
    expect(resolveScopeRoot('global', '/anywhere')).toBe(homedir());
  });
  it('resolveScopeRoot project returns projectDir', () => {
    expect(resolveScopeRoot('project', '/x/y')).toBe('/x/y');
  });
  it('sourceRoot returns ~/.agentkey/repo', () => {
    expect(sourceRoot()).toBe(join(homedir(), '.agentkey', 'repo'));
  });
});
