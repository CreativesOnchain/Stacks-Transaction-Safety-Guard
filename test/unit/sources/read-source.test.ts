import { describe, expect, it } from 'vitest';
import { readSource } from '../../../src/sources/read-source.js';
import { fixturePath } from '../../support/load-fixture.js';

describe('readSource', () => {
  it('reads a file into { path, text }', () => {
    const path = fixturePath('discovery/keep1.ts');
    const source = readSource(path);
    expect(source.path).toBe(path);
    expect(source.text).toContain('keep1');
  });
});
