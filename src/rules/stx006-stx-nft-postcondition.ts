import type { Finding } from '../diagnostics/finding.js';
import { RULE_CATALOG } from '../diagnostics/rule-catalog.js';
import { classifyTransfer } from '../transaction-model/classify-transfer.js';
import type { TransactionCall } from '../transaction-model/model.js';
import { readPostConditions } from '../transaction-model/read-postconditions.js';
import { ruleFinding, type Rule, type RuleContext } from './rule.js';

const META = RULE_CATALOG.STX006;

/**
 * STX006 — a call that moves STX or an NFT (per a configured asset contract) and
 * supplies a present post-conditions array lacking the matching STX or NFT
 * condition. Defaults to warn and is configurable to error. Presence-based:
 * a `Pc(...).ustx()` satisfies the STX case and `Pc(...).nft(...)` the NFT case;
 * opaque or dynamic arrays are treated as satisfying.
 */
export const stx006StxNftPostCondition: Rule = {
  id: META.id,
  evaluate(call: TransactionCall, ctx: RuleContext): Finding[] {
    const { assetClasses } = classifyTransfer(call, ctx.config);
    const postConditions = readPostConditions(call.options);
    if (postConditions.state !== 'present') return [];

    const missingStx = assetClasses.includes('stx') && !postConditions.stxPresent;
    const missingNft = assetClasses.includes('nft') && !postConditions.nftPresent;
    if (!missingStx && !missingNft) return [];

    const asset = missingStx && missingNft ? 'STX and an NFT' : missingStx ? 'STX' : 'an NFT';
    return [
      ruleFinding(
        META,
        `This call moves ${asset} but its post-conditions include no matching condition.`,
        call.location,
      ),
    ];
  },
};
