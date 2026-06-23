import { describe, expect, it } from 'vitest';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverFiles } from '../../../src/sources/discover-files.js';
import { readSource } from '../../../src/sources/read-source.js';
import { parseSource } from '../../../src/ast/parse-source.js';

const here = dirname(fileURLToPath(import.meta.url));
const discoveryRoot = resolve(here, '../../fixtures/discovery');

function relativeNames(files: string[]): string[] {
  return files.map((file) => file.slice(discoveryRoot.length + 1));
}

describe('discoverFiles', () => {
  it('returns matching files (recursively) and honours exclude globs', () => {
    const files = discoverFiles({
      root: discoveryRoot,
      include: ['**/*.{ts,tsx}'],
      exclude: ['ignoreme/**'],
    });

    expect(relativeNames(files)).toEqual(['keep1.ts', 'keep2.tsx', 'nested/keep3.ts']);
    expect(files.every((file) => file.startsWith(discoveryRoot))).toBe(true);
  });

  it('does not return files outside the include globs', () => {
    const files = discoverFiles({ root: discoveryRoot, include: ['**/*.css'], exclude: [] });
    expect(relativeNames(files)).toEqual(['skip.css']);
  });

  it('produces paths that read and parse into a ParsedSource', () => {
    const files = discoverFiles({ root: discoveryRoot, include: ['**/*.ts'], exclude: ['ignoreme/**'] });
    expect(files.length).toBeGreaterThan(0);
    const parsed = files.map((file) => parseSource(readSource(file)));
    expect(parsed.every((source) => source.sourceFile.fileName === source.path)).toBe(true);
  });
});
