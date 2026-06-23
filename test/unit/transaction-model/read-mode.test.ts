import { describe, expect, it } from 'vitest';
import { readMode } from '../../../src/transaction-model/read-mode.js';
import { optionsOf } from '../../support/extract-call.js';

describe('readMode', () => {
  it('reports missing when postConditionMode is absent', () => {
    expect(readMode(optionsOf(`{ functionName: 'transfer' }`))).toBe('missing');
  });

  it('reads the string forms', () => {
    expect(readMode(optionsOf(`{ postConditionMode: 'allow' }`))).toBe('allow');
    expect(readMode(optionsOf(`{ postConditionMode: 'deny' }`))).toBe('deny');
  });

  it('reads the enum member forms', () => {
    expect(readMode(optionsOf(`{ postConditionMode: PostConditionMode.Allow }`))).toBe('allow');
    expect(readMode(optionsOf(`{ postConditionMode: PostConditionMode.Deny }`))).toBe('deny');
  });

  it('treats originator as a present, non-permissive mode', () => {
    expect(readMode(optionsOf(`{ postConditionMode: 'originator' }`))).toBe('deny');
    expect(readMode(optionsOf(`{ postConditionMode: PostConditionMode.Originator }`))).toBe('deny');
  });

  it('reads the numeric enum values', () => {
    expect(readMode(optionsOf(`{ postConditionMode: 1 }`))).toBe('allow');
    expect(readMode(optionsOf(`{ postConditionMode: 2 }`))).toBe('deny');
  });

  it('treats a present-but-dynamic mode as non-permissive', () => {
    expect(readMode(optionsOf(`{ postConditionMode: resolveMode() }`))).toBe('deny');
    expect(readMode(optionsOf(`{ postConditionMode }`))).toBe('deny');
  });

  it('reports deny for unresolved options', () => {
    expect(readMode({ resolved: false, reason: 'missing' })).toBe('deny');
  });
});
