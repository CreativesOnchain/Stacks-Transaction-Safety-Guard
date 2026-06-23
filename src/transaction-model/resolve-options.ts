import ts from 'typescript';
import type { OptionsObject } from './model.js';

/**
 * Resolves a call's options argument to an inspectable object literal under the
 * inline + single-hop policy: an inline object literal, or a same-file `const`
 * declared exactly once and initialized directly to an object literal. Anything
 * else (missing, reassignable, imported, parameter, computed, or chained
 * through another identifier) is reported as `unresolved` so callers can skip
 * it rather than guess.
 */
export function resolveOptions(
  arg: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
): OptionsObject {
  if (!arg) return { resolved: false, reason: 'missing' };
  const literal = toObjectLiteral(arg, sourceFile);
  return literal ? { resolved: true, node: literal } : { resolved: false, reason: 'dynamic' };
}

function toObjectLiteral(
  expr: ts.Expression,
  sourceFile: ts.SourceFile,
): ts.ObjectLiteralExpression | undefined {
  const unwrapped = unwrapParentheses(expr);
  if (ts.isObjectLiteralExpression(unwrapped)) return unwrapped;
  if (ts.isIdentifier(unwrapped)) return resolveConstObjectLiteral(unwrapped.text, sourceFile);
  return undefined;
}

/**
 * Returns the object literal a name is bound to only when the binding is an
 * unambiguous single-hop `const`: exactly one declaration of that name in the
 * file, declared `const`, initialized directly to an object literal.
 */
function resolveConstObjectLiteral(
  name: string,
  sourceFile: ts.SourceFile,
): ts.ObjectLiteralExpression | undefined {
  const declarations: ts.VariableDeclaration[] = [];
  const collect = (node: ts.Node): void => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name
    ) {
      declarations.push(node);
    }
    ts.forEachChild(node, collect);
  };
  collect(sourceFile);

  if (declarations.length !== 1) return undefined;
  const declaration = declarations[0]!;
  const list = declaration.parent;
  const isConst =
    ts.isVariableDeclarationList(list) && (list.flags & ts.NodeFlags.Const) !== 0;
  if (!isConst || !declaration.initializer) return undefined;

  const initializer = unwrapParentheses(declaration.initializer);
  return ts.isObjectLiteralExpression(initializer) ? initializer : undefined;
}

function unwrapParentheses(expr: ts.Expression): ts.Expression {
  let current = expr;
  while (ts.isParenthesizedExpression(current)) current = current.expression;
  return current;
}

/**
 * Finds the property entry named `name` on an object literal. Matches both
 * identifier (`functionName:`) and string-literal (`'functionName':`) keys, and
 * shorthand entries (`{ functionName }`).
 */
export function getProperty(
  object: ts.ObjectLiteralExpression,
  name: string,
): ts.ObjectLiteralElementLike | undefined {
  return object.properties.find((property) => {
    const key = property.name;
    if (!key) return false;
    if (ts.isIdentifier(key) || ts.isStringLiteral(key)) return key.text === name;
    return false;
  });
}

/** True when the object literal declares a property with the given key. */
export function hasProperty(object: ts.ObjectLiteralExpression, name: string): boolean {
  return getProperty(object, name) !== undefined;
}

/**
 * Returns the initializer expression of a property, or `undefined` when the
 * property is absent or supplies no static value (shorthand, spread, accessor).
 */
export function getPropertyValue(
  object: ts.ObjectLiteralExpression,
  name: string,
): ts.Expression | undefined {
  const property = getProperty(object, name);
  if (property && ts.isPropertyAssignment(property)) return property.initializer;
  return undefined;
}

/** Reads a string-literal (or non-substitution template) value, when present. */
export function getStringLiteralValue(expr: ts.Expression | undefined): string | undefined {
  if (!expr) return undefined;
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text;
  return undefined;
}
