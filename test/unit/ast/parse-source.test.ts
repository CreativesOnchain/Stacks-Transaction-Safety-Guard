import { describe, expect, it } from 'vitest';
import { parseSnippet } from '../../support/parse-snippet.js';

describe('parseSource', () => {
  it('parses TypeScript into a SourceFile', () => {
    const parsed = parseSnippet('const a: number = 1;');
    expect(parsed.sourceFile.statements.length).toBe(1);
  });

  it('parses TSX with JSX syntax', () => {
    const parsed = parseSnippet('const el = <div>hi</div>;', 'snippet.tsx');
    expect(parsed.sourceFile.statements.length).toBe(1);
  });

  it('maps a character offset to a 1-based line and column', () => {
    const code = 'const a = 1;\nconst b = 2;\n';
    const parsed = parseSnippet(code);
    expect(parsed.getLineCol(code.indexOf('const b'))).toEqual({ line: 2, column: 1 });
    expect(parsed.getLineCol(code.indexOf('b'))).toEqual({ line: 2, column: 7 });
  });
});
