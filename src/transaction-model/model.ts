import type ts from 'typescript';
import type { Location } from '../diagnostics/location.js';

/**
 * The transaction-building APIs this tool recognizes. `broadcastTransaction` is
 * captured for context only; no rule fires on it in the MVP.
 */
export type CallKind = 'makeContractCall' | 'stx_callContract' | 'broadcastTransaction';

/** Why an options argument could not be reduced to an object literal. */
export type UnresolvedReason = 'missing' | 'dynamic';

/** Options resolved to an inspectable object-literal expression. */
export interface ResolvedOptions {
  resolved: true;
  node: ts.ObjectLiteralExpression;
}

/** Options that could not be resolved under the inline + single-hop policy. */
export interface UnresolvedOptions {
  resolved: false;
  reason: UnresolvedReason;
}

/**
 * The resolved view of a call's options argument. Downstream readers operate on
 * the object literal when `resolved`, and treat anything `unresolved`
 * conservatively so dynamic inputs never produce a false positive.
 */
export type OptionsObject = ResolvedOptions | UnresolvedOptions;

export type PostConditionsState = 'absent' | 'empty' | 'present';

/**
 * The reduced state of a call's `postConditions` property, plus which asset
 * classes have at least one matching post-condition. Presence flags are only
 * meaningful when `state` is `present`.
 */
export interface PostConditionsInfo {
  state: PostConditionsState;
  ftPresent: boolean;
  stxPresent: boolean;
  nftPresent: boolean;
}

/** The reduced state of a call's `postConditionMode` property. */
export type PostConditionMode = 'deny' | 'allow' | 'missing';

/**
 * A normalized Stacks transaction call extracted from source. `functionName`
 * and `contractId` are present only when statically resolvable to string
 * literals; the readers and rules treat their absence conservatively.
 */
export interface TransactionCall {
  kind: CallKind;
  /** Source text of the callee expression, for reporting (e.g. `makeContractCall`). */
  callee: string;
  /** Resolved `functionName` string literal, when statically known. */
  functionName?: string;
  /** Combined `"address.name"` contract identifier, when statically known. */
  contractId?: string;
  options: OptionsObject;
  location: Location;
}
