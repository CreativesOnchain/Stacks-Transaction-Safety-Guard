import { makeContractCall, Pc, PostConditionMode } from '@stacks/transactions';

/**
 * Unsafe sBTC transfer #1. Two high-impact mistakes:
 *  1. The post-conditions constrain an STX transfer but not the sBTC token the call
 *     actually moves, so the fungible-token amount is unguarded (STX005).
 *  2. A raw `senderKey` signs in application code, exposing a private key (STX007).
 */
export async function transferSbtc(recipient: string, amount: bigint) {
  return makeContractCall({
    contractAddress: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4',
    contractName: 'sbtc-token',
    functionName: 'transfer',
    functionArgs: [recipient, amount],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [Pc.principal(recipient).willSendEq(amount).ustx()],
    senderKey: process.env.SIGNER_KEY!,
    network: 'mainnet',
  });
}

/**
 * Unsafe sBTC transfer #2. No post-conditions at all (STX001) and no explicit
 * post-condition mode (STX004), again signing with a raw `senderKey` (STX007).
 */
export async function quickSend(recipient: string, amount: bigint) {
  return makeContractCall({
    contractAddress: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4',
    contractName: 'sbtc-token',
    functionName: 'transfer',
    functionArgs: [recipient, amount],
    senderKey: process.env.SIGNER_KEY!,
    network: 'mainnet',
  });
}
