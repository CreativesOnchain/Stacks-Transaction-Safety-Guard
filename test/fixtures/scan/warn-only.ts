import { Pc, makeContractCall } from '@stacks/transactions';

// Transfer-like call WITH post-conditions present but no postConditionMode set:
// yields only STX004 (warn). Used to prove --strict turns warnings into failures.
export function send(recipient: string, amount: bigint) {
  return makeContractCall({
    contractAddress: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR',
    contractName: 'my-token',
    functionName: 'transfer',
    functionArgs: [recipient, amount],
    postConditions: [
      Pc.principal('SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR')
        .willSendEq(amount)
        .ft('SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token', 'my-token'),
    ],
  });
}
