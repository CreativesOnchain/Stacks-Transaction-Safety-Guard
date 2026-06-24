import type { Finding } from '../diagnostics/finding.js';
import { RULE_CATALOG } from '../diagnostics/rule-catalog.js';
import { classifyTransfer } from '../transaction-model/classify-transfer.js';
import type { TransactionCall } from '../transaction-model/model.js';
import { readMode } from '../transaction-model/read-mode.js';
import { ruleFinding, type Rule, type RuleContext } from './rule.js';

const META = RULE_CATALOG.STX003;

/**
 * STX003 — a transfer-like call whose `postConditionMode` resolves to `allow`.
 * Allow mode disables post-condition enforcement, so any post-conditions that
 * are present are not enforced. Independent of the post-conditions array and
 * mutually exclusive with the missing-mode warning (STX004).
 */
export const stx003AllowMode: Rule = {
  id: META.id,
  evaluate(call: TransactionCall, ctx: RuleContext): Finding[] {
    if (!classifyTransfer(call, ctx.config).transferLike) return [];
    if (readMode(call.options) !== 'allow') return [];
    return [
      ruleFinding(
        META,
        'postConditionMode is set to Allow, which disables post-condition enforcement for this transfer.',
        call.location,
      ),
    ];
  },
};
