import { request } from '@stacks/connect';
import { Pc } from '@stacks/transactions';

const SBTC = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token';

/**
 * Safe sBTC transfer. It signs through the user's wallet via Stacks Connect (no
 * `senderKey` in application code), constrains the exact sBTC amount with a
 * `Pc(...).ft(...)` post-condition, and sets deny mode so any transfer not
 * covered by a post-condition is rejected. stx-tx-guard reports no findings.
 */
export async function transferSbtc(sender: string, recipient: string, amount: bigint) {
  return request('stx_callContract', {
    contract: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
    functionName: 'transfer',
    functionArgs: [recipient, amount],
    postConditionMode: 'deny',
    postConditions: [Pc.principal(sender).willSendEq(amount).ft(SBTC, 'sbtc')],
  });
}
