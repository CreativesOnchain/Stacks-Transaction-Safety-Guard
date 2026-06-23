import { readFileSync } from 'node:fs';

/**
 * A source file's path and raw text. This is the only representation that
 * crosses the IO boundary; everything downstream operates on it without
 * touching the filesystem.
 */
export interface SourceText {
  path: string;
  text: string;
}

export function readSource(path: string): SourceText {
  return { path, text: readFileSync(path, 'utf8') };
}
