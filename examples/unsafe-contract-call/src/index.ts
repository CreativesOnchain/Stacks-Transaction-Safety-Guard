import { makeContractCall } from '@stacks/transactions';

/**
 * An asset-moving contract call with no post-conditions and no post-condition
 * mode: the signed transaction could move tokens without any wallet-enforced
 * limit. stx-tx-guard flags this with STX001 (missing post-conditions, error)
 * and STX004 (unspecified mode, warn).
 */
export async function sendTokens(recipient: string, amount: bigint) {
  return makeContractCall({
    contractAddress: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR',
    contractName: 'my-token',
    functionName: 'transfer',
    functionArgs: [recipient, amount],
    network: 'mainnet',
  });
}
