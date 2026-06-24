import { request } from '@stacks/connect';

/**
 * A read-only contract call: it neither targets a configured asset contract nor
 * uses a transfer-like function name, so it moves no assets. stx-tx-guard should
 * detect the call yet report nothing — proving the scanner does not blindly flag
 * every contract call.
 */
export async function resolveName(name: string) {
  return request('stx_callContract', {
    contract: 'SP000000000000000000002Q6VF78.bns',
    functionName: 'name-resolve',
    functionArgs: [name],
  });
}
