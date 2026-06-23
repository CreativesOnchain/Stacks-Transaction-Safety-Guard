import { describe, expect, it } from 'vitest';
import { resolveSeverity } from '../../../src/engine/resolve-severity.js';

describe('resolveSeverity', () => {
  it('returns the configured severity without strict', () => {
    expect(resolveSeverity('error', false)).toBe('error');
    expect(resolveSeverity('warn', false)).toBe('warn');
  });

  it('keeps off disabled regardless of strict', () => {
    expect(resolveSeverity('off', false)).toBe('off');
    expect(resolveSeverity('off', true)).toBe('off');
  });

  it('escalates warn to error under strict', () => {
    expect(resolveSeverity('warn', true)).toBe('error');
  });

  it('leaves error as error under strict', () => {
    expect(resolveSeverity('error', true)).toBe('error');
  });
});
