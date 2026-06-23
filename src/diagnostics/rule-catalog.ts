import type { Severity } from './severity.js';

/**
 * The complete, ordered set of rule identifiers shipped in this version.
 */
export const RULE_IDS = [
  'STX001',
  'STX002',
  'STX003',
  'STX004',
  'STX005',
  'STX006',
  'STX007',
] as const;

export type RuleId = (typeof RULE_IDS)[number];

/**
 * Static metadata for a rule: its title, shipped default severity, the one-line
 * remediation surfaced as a finding's suggestion, and a stable anchor linking
 * to the rule's documentation entry.
 */
export interface RuleMeta {
  id: RuleId;
  title: string;
  defaultSeverity: Severity;
  fixHint: string;
  docAnchor: string;
}

/**
 * The single source of truth for each rule's presentation and default severity.
 * Rules read their `fixHint` from here so messages stay consistent, and the
 * shipped default configuration derives its severities from this catalog.
 */
export const RULE_CATALOG: Record<RuleId, RuleMeta> = {
  STX001: {
    id: 'STX001',
    title: 'Missing post-conditions',
    defaultSeverity: 'error',
    fixHint: 'Add postConditions covering each asset this call transfers, and set postConditionMode to Deny.',
    docAnchor: 'stx001',
  },
  STX002: {
    id: 'STX002',
    title: 'Empty post-conditions',
    defaultSeverity: 'error',
    fixHint: 'Replace the empty postConditions array with conditions for each asset this call transfers.',
    docAnchor: 'stx002',
  },
  STX003: {
    id: 'STX003',
    title: 'Permissive post-condition mode',
    defaultSeverity: 'error',
    fixHint: 'Use PostConditionMode.Deny so transfers not covered by a post-condition are rejected.',
    docAnchor: 'stx003',
  },
  STX004: {
    id: 'STX004',
    title: 'Unspecified post-condition mode',
    defaultSeverity: 'warn',
    fixHint: 'Set postConditionMode explicitly to Deny rather than relying on the default.',
    docAnchor: 'stx004',
  },
  STX005: {
    id: 'STX005',
    title: 'Missing fungible-token post-condition',
    defaultSeverity: 'error',
    fixHint: 'Add a Pc(...).ft(...) post-condition for the token this call moves.',
    docAnchor: 'stx005',
  },
  STX006: {
    id: 'STX006',
    title: 'Missing STX or NFT post-condition',
    defaultSeverity: 'warn',
    fixHint: 'Add a Pc(...).ustx() or Pc(...).nft(...) post-condition for the asset this call moves.',
    docAnchor: 'stx006',
  },
  STX007: {
    id: 'STX007',
    title: 'Signing key in transaction-building code',
    defaultSeverity: 'error',
    fixHint: 'Sign with a wallet or Stacks Connect instead of embedding a senderKey in application code.',
    docAnchor: 'stx007',
  },
};

/**
 * Canonical default severity for each rule, derived from {@link RULE_CATALOG}.
 * User configuration may override any of these; the shipped default
 * configuration is built from this map.
 */
export const RULE_DEFAULT_SEVERITY: Record<RuleId, Severity> = Object.fromEntries(
  RULE_IDS.map((id) => [id, RULE_CATALOG[id].defaultSeverity]),
) as Record<RuleId, Severity>;
