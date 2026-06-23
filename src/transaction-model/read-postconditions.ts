import ts from 'typescript';
import type { OptionsObject, PostConditionsInfo } from './model.js';
import { getPropertyValue, hasProperty } from './resolve-options.js';

/** Conservative result used whenever the array cannot be introspected. */
const SATISFIED_PRESENT: PostConditionsInfo = {
  state: 'present',
  ftPresent: true,
  stxPresent: true,
  nftPresent: true,
};

/**
 * Reduces the `postConditions` property of a call's options to a state plus,
 * for present arrays, which asset classes have a matching post-condition.
 *
 * Anything that cannot be introspected — unresolved options, a dynamic
 * (non-literal) array, a shorthand property, or an opaque entry such as a
 * serialized string or spread — is treated as `present` and satisfying every
 * asset class. This keeps the presence-based checks free of false positives.
 */
export function readPostConditions(options: OptionsObject): PostConditionsInfo {
  if (!options.resolved) return SATISFIED_PRESENT;
  const object = options.node;

  if (!hasProperty(object, 'postConditions')) {
    return { state: 'absent', ftPresent: false, stxPresent: false, nftPresent: false };
  }

  const value = getPropertyValue(object, 'postConditions');
  // Present but shorthand or accessor: a value exists, we just cannot read it.
  if (!value || !ts.isArrayLiteralExpression(value)) return SATISFIED_PRESENT;

  if (value.elements.length === 0) {
    return { state: 'empty', ftPresent: false, stxPresent: false, nftPresent: false };
  }

  let ftPresent = false;
  let stxPresent = false;
  let nftPresent = false;
  let opaque = false;

  for (const element of value.elements) {
    if (ts.isSpreadElement(element)) {
      opaque = true;
      continue;
    }
    switch (classifyPostCondition(element)) {
      case 'ft':
        ftPresent = true;
        break;
      case 'stx':
        stxPresent = true;
        break;
      case 'nft':
        nftPresent = true;
        break;
      default:
        opaque = true;
    }
  }

  if (opaque) return SATISFIED_PRESENT;
  return { state: 'present', ftPresent, stxPresent, nftPresent };
}

type PostConditionClass = 'ft' | 'stx' | 'nft' | 'opaque';

/**
 * Classifies a single post-condition array entry by the terminal of its `Pc`
 * builder chain: `.ft()` → FT, `.ustx()` → STX, `.nft()` → NFT. Only chains
 * rooted at the `Pc` namespace are recognized; anything else (serialized
 * strings, `Pc.fromHex(...)`, arbitrary expressions) is opaque.
 */
function classifyPostCondition(expr: ts.Expression): PostConditionClass {
  const node = unwrapParentheses(expr);
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && rootedAtPc(node)) {
    switch (node.expression.name.text) {
      case 'ft':
        return 'ft';
      case 'ustx':
        return 'stx';
      case 'nft':
        return 'nft';
      default:
        return 'opaque';
    }
  }
  return 'opaque';
}

function rootedAtPc(expr: ts.Expression): boolean {
  let current: ts.Expression = expr;
  for (;;) {
    if (ts.isCallExpression(current)) current = current.expression;
    else if (ts.isPropertyAccessExpression(current)) current = current.expression;
    else if (ts.isParenthesizedExpression(current)) current = current.expression;
    else break;
  }
  return ts.isIdentifier(current) && current.text === 'Pc';
}

function unwrapParentheses(expr: ts.Expression): ts.Expression {
  let current = expr;
  while (ts.isParenthesizedExpression(current)) current = current.expression;
  return current;
}
