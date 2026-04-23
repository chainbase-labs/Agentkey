import { describe, it, expect, vi } from 'vitest';
import { isWindows, canSymlink } from '../../src/utils/platform.js';

describe('platform', () => {
  it('isWindows returns true on win32', () => {
    const origPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    Object.defineProperty(process, 'platform', { value: 'win32' });
    expect(isWindows()).toBe(true);
    Object.defineProperty(process, 'platform', origPlatform!);
  });

  it('canSymlink returns true on non-Windows', async () => {
    const origPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    expect(await canSymlink()).toBe(true);
    Object.defineProperty(process, 'platform', origPlatform!);
  });
});
