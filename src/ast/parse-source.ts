import ts from 'typescript';

export interface LineColumn {
  /** 1-based line number. */
  line: number;
  /** 1-based column number. */
  column: number;
}

/**
 * A parsed source: its path, original text, the TypeScript AST, and a helper to
 * translate character offsets into human-facing 1-based line/column positions.
 * This module is the sole place that depends on the TypeScript compiler.
 */
export interface ParsedSource {
  path: string;
  text: string;
  sourceFile: ts.SourceFile;
  getLineCol(position: number): LineColumn;
}

function scriptKindFor(path: string): ts.ScriptKind {
  if (path.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (path.endsWith('.jsx')) return ts.ScriptKind.JSX;
  if (path.endsWith('.js') || path.endsWith('.mjs') || path.endsWith('.cjs')) {
    return ts.ScriptKind.JS;
  }
  return ts.ScriptKind.TS;
}

export function parseSource(source: { path: string; text: string }): ParsedSource {
  const sourceFile = ts.createSourceFile(
    source.path,
    source.text,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    scriptKindFor(source.path),
  );

  return {
    path: source.path,
    text: source.text,
    sourceFile,
    getLineCol(position: number): LineColumn {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(position);
      return { line: line + 1, column: character + 1 };
    },
  };
}
