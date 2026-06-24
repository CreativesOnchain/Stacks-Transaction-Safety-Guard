import type { Finding } from '../diagnostics/finding.js';
import { RULE_CATALOG } from '../diagnostics/rule-catalog.js';
import { classifyTransfer } from '../transaction-model/classify-transfer.js';
import type { TransactionCall } from '../transaction-model/model.js';
import { readPostConditions } from '../transaction-model/read-postconditions.js';
import { ruleFinding, type Rule, type RuleContext } from './rule.js';

const META = RULE_CATALOG.STX002;

/**
 * STX002 — a transfer-like call whose `postConditions` is an explicit empty
 * array (`[]`). An empty array enforces nothing, yet reads as a deliberate
 * choice, so it is flagged distinctly from the absent case (STX001). By
 * precedence it fires only on the `empty` state.
 */
export const stx002EmptyPostConditions: Rule = {
  id: META.id,
  evaluate(call: TransactionCall, ctx: RuleContext): Finding[] {
    if (!classifyTransfer(call, ctx.config).transferLike) return [];
    if (readPostConditions(call.options).state !== 'empty') return [];
    return [
      ruleFinding(
        META,
        'This asset-moving call has an empty postConditions array, so it enforces nothing.',
        call.location,
      ),
    ];
  },
};
