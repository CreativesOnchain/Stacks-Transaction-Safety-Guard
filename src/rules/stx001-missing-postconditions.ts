import type { Finding } from '../diagnostics/finding.js';
import { RULE_CATALOG } from '../diagnostics/rule-catalog.js';
import { classifyTransfer } from '../transaction-model/classify-transfer.js';
import type { TransactionCall } from '../transaction-model/model.js';
import { readPostConditions } from '../transaction-model/read-postconditions.js';
import { ruleFinding, type Rule, type RuleContext } from './rule.js';

const META = RULE_CATALOG.STX001;

/**
 * STX001 — a transfer-like call whose `postConditions` property is absent. With
 * no post-conditions the wallet cannot constrain what the transaction moves, so
 * this is the highest-signal missing-guard case. By precedence it fires only on
 * the `absent` state; the empty-array (STX002) and present-array (STX005/006)
 * cases are handled by their own rules, so a call is never double-flagged.
 */
export const stx001MissingPostConditions: Rule = {
  id: META.id,
  evaluate(call: TransactionCall, ctx: RuleContext): Finding[] {
    if (!classifyTransfer(call, ctx.config).transferLike) return [];
    if (readPostConditions(call.options).state !== 'absent') return [];
    return [
      ruleFinding(
        META,
        'This asset-moving call declares no post-conditions, so it can transfer assets without limit.',
        call.location,
      ),
    ];
  },
};
