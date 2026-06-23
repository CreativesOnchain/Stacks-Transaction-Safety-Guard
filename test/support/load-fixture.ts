import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSource, type ParsedSource } from '../../src/ast/parse-source.js';
import type { SourceText } from '../../src/sources/read-source.js';

const fixturesRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');

/** Absolute path to a fixture, addressed by its path under `test/fixtures`. */
export function fixturePath(name: string): string {
  return resolve(fixturesRoot, name);
}

export function loadFixture(name: string): SourceText {
  const path = fixturePath(name);
  return { path, text: readFileSync(path, 'utf8') };
}

export function parseFixture(name: string): ParsedSource {
  return parseSource(loadFixture(name));
}
