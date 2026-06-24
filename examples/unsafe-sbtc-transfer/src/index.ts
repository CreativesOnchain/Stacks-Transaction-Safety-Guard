import { makeContractCall, Pc, PostConditionMode } from '@stacks/transactions';

const SBTC = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token';

/**
 * Unsafe sBTC transfer. Two high-impact mistakes:
 *  1. The post-conditions constrain an STX transfer but not the sBTC token the
 *     call actually moves, so the fungible-token amount is unguarded (STX005).
 *  2. A raw `senderKey` signs in application code, exposing a private key (STX007).
 */
export async function transferSbtc(recipient: string, amount: bigint) {
  return makeContractCall({
    contractAddress: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4',
    contractName: 'sbtc-token',
    functionName: 'transfer',
    functionArgs: [recipient, amount],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [Pc.principal('SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4').willSendEq(amount).ustx()],
    senderKey: process.env.SIGNER_KEY!,
    network: 'mainnet',
  });
}

// Reference the asset principal so the example reads as a complete module.
export const SBTC_TOKEN = SBTC;
