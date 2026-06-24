import type { Finding } from '../diagnostics/finding.js';
import { RULE_CATALOG } from '../diagnostics/rule-catalog.js';
import { classifyTransfer } from '../transaction-model/classify-transfer.js';
import type { TransactionCall } from '../transaction-model/model.js';
import { readPostConditions } from '../transaction-model/read-postconditions.js';
import { ruleFinding, type Rule, type RuleContext } from './rule.js';

const META = RULE_CATALOG.STX005;

/**
 * STX005 — a call that targets a configured SIP-010 / sBTC asset contract and
 * supplies a present (non-empty) post-conditions array that contains no
 * fungible-token condition. The transfer is constrained for other assets but the
 * token it moves is left unguarded. Presence-based (Q6): any `Pc(...).ft(...)`
 * condition satisfies it; opaque or dynamic arrays are treated as satisfying.
 */
export const stx005FtPostCondition: Rule = {
  id: META.id,
  evaluate(call: TransactionCall, ctx: RuleContext): Finding[] {
    if (!classifyTransfer(call, ctx.config).assetClasses.includes('sip010')) return [];
    const postConditions = readPostConditions(call.options);
    if (postConditions.state !== 'present' || postConditions.ftPresent) return [];
    return [
      ruleFinding(
        META,
        'This call moves a SIP-010 token but its post-conditions include no fungible-token condition.',
        call.location,
      ),
    ];
  },
};
