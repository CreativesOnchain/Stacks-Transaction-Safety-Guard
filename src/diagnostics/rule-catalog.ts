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
 * Canonical default severity for each rule. User configuration may override any
 * of these; the shipped default configuration is derived from this map so the
 * defaults have a single source of truth.
 */
export const RULE_DEFAULT_SEVERITY: Record<RuleId, Severity> = {
  STX001: 'error',
  STX002: 'error',
  STX003: 'error',
  STX004: 'warn',
  STX005: 'error',
  STX006: 'warn',
  STX007: 'error',
};
