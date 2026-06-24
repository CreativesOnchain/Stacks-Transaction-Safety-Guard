import type { Finding } from '../diagnostics/finding.js';
import { RULE_CATALOG } from '../diagnostics/rule-catalog.js';
import { classifyTransfer } from '../transaction-model/classify-transfer.js';
import type { TransactionCall } from '../transaction-model/model.js';
import { readMode } from '../transaction-model/read-mode.js';
import { ruleFinding, type Rule, type RuleContext } from './rule.js';

const META = RULE_CATALOG.STX004;

/**
 * STX004 — a transfer-like call that does not set `postConditionMode` at all
 * (warn). Leaving the mode unset relies on a default rather than an explicit
 * Deny; flagged so the intent is made explicit. Mutually exclusive with the
 * allow-mode error (STX003) and independent of the post-conditions array.
 */
export const stx004MissingMode: Rule = {
  id: META.id,
  evaluate(call: TransactionCall, ctx: RuleContext): Finding[] {
    if (!classifyTransfer(call, ctx.config).transferLike) return [];
    if (readMode(call.options) !== 'missing') return [];
    return [
      ruleFinding(META, 'postConditionMode is not set on this asset-moving call.', call.location),
    ];
  },
};
