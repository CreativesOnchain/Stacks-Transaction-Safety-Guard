import type { Finding } from '../diagnostics/finding.js';
import { RULE_CATALOG } from '../diagnostics/rule-catalog.js';
import { findSenderKeyUsages } from '../transaction-model/read-senderkey.js';
import { ruleFinding, type FileRuleContext, type Rule } from './rule.js';

const META = RULE_CATALOG.STX007;

/**
 * STX007 — a `senderKey` (a raw private key) used anywhere in a scanned file.
 * Signing in application code means a private key is present in the frontend
 * bundle; production code should sign through a wallet or Stacks Connect. This is
 * a file-level rule (Q3): it flags every usage regardless of whether the call is
 * transfer-like; scoping is the user's job via `exclude` globs.
 */
export const stx007SenderKey: Rule = {
  id: META.id,
  evaluateFile(ctx: FileRuleContext): Finding[] {
    return findSenderKeyUsages(ctx.source).map((usage) =>
      ruleFinding(
        META,
        'A senderKey (a raw private key) is used in transaction-building code.',
        usage.location,
      ),
    );
  },
};
