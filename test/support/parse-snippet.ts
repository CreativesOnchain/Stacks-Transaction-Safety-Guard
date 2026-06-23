import { parseSource, type ParsedSource } from '../../src/ast/parse-source.js';

/**
 * Parses an inline code string for unit tests that do not assert on file
 * locations. Prefer a fixture file when line/column accuracy matters.
 */
export function parseSnippet(code: string, fileName = 'snippet.ts'): ParsedSource {
  return parseSource({ path: fileName, text: code });
}
