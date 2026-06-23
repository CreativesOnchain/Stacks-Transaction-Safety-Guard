import { describe, expect, it } from 'vitest';
import { resolveOptions } from '../../../src/transaction-model/resolve-options.js';
import { firstArgOf } from '../../support/extract-call.js';

function resolve(code: string) {
  const { arg, sourceFile } = firstArgOf(code);
  return resolveOptions(arg, sourceFile);
}

describe('resolveOptions', () => {
  it('resolves an inline object literal', () => {
    expect(resolve('f({ a: 1 });').resolved).toBe(true);
  });

  it('resolves a parenthesized inline object literal', () => {
    expect(resolve('f(({ a: 1 }));').resolved).toBe(true);
  });

  it('resolves a single same-file const initialized to an object literal', () => {
    expect(resolve('const opts = { a: 1 };\nf(opts);').resolved).toBe(true);
  });

  it('marks a missing argument as unresolved/missing', () => {
    expect(resolve('f();')).toEqual({ resolved: false, reason: 'missing' });
  });

  it('does not resolve a reassignable let binding', () => {
    expect(resolve('let opts = { a: 1 };\nf(opts);')).toEqual({ resolved: false, reason: 'dynamic' });
  });

  it('does not resolve an ambiguous name with multiple declarations', () => {
    const result = resolve(
      'const opts = { a: 1 };\nfunction g() { const opts = { b: 2 }; return opts; }\nf(opts);',
    );
    expect(result.resolved).toBe(false);
  });

  it('does not resolve an identifier with no same-file declaration', () => {
    expect(resolve('f(importedOpts);').resolved).toBe(false);
  });

  it('does not resolve a const initialized to a non-literal', () => {
    expect(resolve('const opts = build();\nf(opts);').resolved).toBe(false);
  });

  it('does not chase a second identifier hop', () => {
    expect(resolve('const a = { x: 1 };\nconst b = a;\nf(b);').resolved).toBe(false);
  });
});
