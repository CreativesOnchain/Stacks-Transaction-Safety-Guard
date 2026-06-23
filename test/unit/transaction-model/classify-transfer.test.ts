import { describe, expect, it } from 'vitest';
import { classifyTransfer } from '../../../src/transaction-model/classify-transfer.js';
import type { TransactionCall } from '../../../src/transaction-model/model.js';
import { DEFAULT_CONFIG } from '../../../src/config/default-config.js';

const SBTC = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token';

function call(partial: Partial<TransactionCall>): TransactionCall {
  return {
    kind: 'makeContractCall',
    callee: 'makeContractCall',
    options: { resolved: false, reason: 'dynamic' },
    location: { file: 'snippet.ts', line: 1, column: 1 },
    ...partial,
  };
}

describe('classifyTransfer', () => {
  it('is transfer-like when functionName is a configured transfer name', () => {
    const result = classifyTransfer(call({ functionName: 'transfer' }), DEFAULT_CONFIG);
    expect(result.transferLike).toBe(true);
    expect(result.assetClasses).toEqual([]);
  });

  it('is not transfer-like for an unknown function and unmatched contract', () => {
    expect(classifyTransfer(call({ functionName: 'getBalance' }), DEFAULT_CONFIG).transferLike).toBe(
      false,
    );
  });

  it('is not transfer-like when functionName is unresolved', () => {
    expect(classifyTransfer(call({}), DEFAULT_CONFIG).transferLike).toBe(false);
  });

  it('resolves the asset class and key from a matching asset contract', () => {
    const result = classifyTransfer(call({ functionName: 'transfer', contractId: SBTC }), DEFAULT_CONFIG);
    expect(result.transferLike).toBe(true);
    expect(result.assetClasses).toEqual(['sip010']);
    expect(result.matchedContract).toBe('sbtc');
  });

  it('matches a contract even when the function is not a transfer name', () => {
    const result = classifyTransfer(call({ functionName: 'getBalance', contractId: SBTC }), DEFAULT_CONFIG);
    expect(result.transferLike).toBe(true);
    expect(result.assetClasses).toEqual(['sip010']);
  });
});
