import ts from 'typescript';
import type { ParsedSource } from '../ast/parse-source.js';
import type { Location } from '../diagnostics/location.js';

/** A `senderKey` reference found in a scanned file. */
export interface SenderKeyUsage {
  location: Location;
}

/**
 * Finds every `senderKey` object property in a file — both `senderKey: ...` and
 * the shorthand `{ senderKey }`. A `senderKey` is a raw private key, and the
 * MVP flags it anywhere in scanned files (Q3); scoping is left to the user's
 * include/exclude globs. Each usage carries the location of the property name.
 */
export function findSenderKeyUsages(parsed: ParsedSource): SenderKeyUsage[] {
  const { sourceFile } = parsed;
  const usages: SenderKeyUsage[] = [];

  const visit = (node: ts.Node): void => {
    if (
      (ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'senderKey'
    ) {
      const { line, column } = parsed.getLineCol(node.name.getStart(sourceFile));
      usages.push({ location: { file: parsed.path, line, column } });
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return usages;
}
