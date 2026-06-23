import ts from 'typescript';
import type { ParsedSource } from '../ast/parse-source.js';
import type { CallKind, OptionsObject, TransactionCall } from './model.js';
import { getPropertyValue, getStringLiteralValue, resolveOptions } from './resolve-options.js';

/**
 * Walks a parsed source and returns every Stacks transaction-building call it
 * recognizes, with its options argument resolved and its target identity
 * (`functionName` / `contractId`) extracted where statically available.
 */
export function findTransactionCalls(parsed: ParsedSource): TransactionCall[] {
  const { sourceFile } = parsed;
  const calls: TransactionCall[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const identified = identifyCall(node);
      if (identified) {
        const options = resolveOptions(identified.optionsArg, sourceFile);
        const identity = extractIdentity(identified.kind, options);
        const start = node.getStart(sourceFile);
        const { line, column } = parsed.getLineCol(start);
        calls.push({
          kind: identified.kind,
          callee: node.expression.getText(sourceFile),
          ...identity,
          options,
          location: { file: parsed.path, line, column },
        });
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return calls;
}

interface IdentifiedCall {
  kind: CallKind;
  optionsArg: ts.Expression | undefined;
}

/**
 * Classifies a call expression by its callee name. The callee may be a bare
 * identifier (named import) or a property access (namespace import), so the
 * rightmost name is used. `request` is only matched when one of its arguments
 * is the `"stx_callContract"` method literal, covering both documented
 * overloads (`request(method, params)` and `request(options, method, params)`).
 */
function identifyCall(node: ts.CallExpression): IdentifiedCall | undefined {
  const name = calleeName(node.expression);
  if (name === undefined) return undefined;

  if (name === 'makeContractCall') return { kind: 'makeContractCall', optionsArg: node.arguments[0] };
  if (name === 'broadcastTransaction') {
    return { kind: 'broadcastTransaction', optionsArg: node.arguments[0] };
  }
  if (name === 'request') {
    if (getStringLiteralValue(node.arguments[0]) === 'stx_callContract') {
      return { kind: 'stx_callContract', optionsArg: node.arguments[1] };
    }
    if (getStringLiteralValue(node.arguments[1]) === 'stx_callContract') {
      return { kind: 'stx_callContract', optionsArg: node.arguments[2] };
    }
  }
  return undefined;
}

function calleeName(expr: ts.Expression): string | undefined {
  if (ts.isIdentifier(expr)) return expr.text;
  if (ts.isPropertyAccessExpression(expr)) return expr.name.text;
  return undefined;
}

/**
 * Reads the call's target identity from its resolved options. `makeContractCall`
 * splits the contract across `contractAddress` + `contractName`, while
 * `stx_callContract` carries a combined `contract` id; both are normalized to a
 * single `"address.name"` string. `broadcastTransaction` has no such fields.
 */
function extractIdentity(
  kind: CallKind,
  options: OptionsObject,
): { functionName?: string; contractId?: string } {
  if (kind === 'broadcastTransaction' || !options.resolved) return {};
  const object = options.node;

  const functionName = getStringLiteralValue(getPropertyValue(object, 'functionName'));

  let contractId: string | undefined;
  if (kind === 'stx_callContract') {
    contractId = getStringLiteralValue(getPropertyValue(object, 'contract'));
  } else {
    const address = getStringLiteralValue(getPropertyValue(object, 'contractAddress'));
    const contractName = getStringLiteralValue(getPropertyValue(object, 'contractName'));
    if (address && contractName) contractId = `${address}.${contractName}`;
  }

  return { ...(functionName !== undefined && { functionName }), ...(contractId !== undefined && { contractId }) };
}
