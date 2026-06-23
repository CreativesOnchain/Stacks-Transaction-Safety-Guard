import ts from 'typescript';
import { parseSnippet } from './parse-snippet.js';
import { resolveOptions } from '../../src/transaction-model/resolve-options.js';
import type { OptionsObject } from '../../src/transaction-model/model.js';

/**
 * The first argument of the first `<callee>(...)` call in a snippet, together
 * with the source file it was parsed from. Used to drive the options resolver
 * directly in unit tests.
 */
export function firstArgOf(
  code: string,
  callee = 'f',
): { arg: ts.Expression | undefined; sourceFile: ts.SourceFile } {
  const parsed = parseSnippet(code);
  let target: ts.CallExpression | undefined;
  const visit = (node: ts.Node): void => {
    if (
      !target &&
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === callee
    ) {
      target = node;
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed.sourceFile);
  return { arg: target?.arguments[0], sourceFile: parsed.sourceFile };
}

/**
 * Resolves the options view of an object-literal snippet, e.g.
 * `optionsOf("{ postConditions: [] }")`, for reader unit tests.
 */
export function optionsOf(objectLiteral: string): OptionsObject {
  const { arg, sourceFile } = firstArgOf(`f(${objectLiteral});`);
  return resolveOptions(arg, sourceFile);
}
