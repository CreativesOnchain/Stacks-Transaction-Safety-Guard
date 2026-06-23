import { describe, expect, it } from 'vitest';
import { parseSnippet } from '../../support/parse-snippet.js';
import { findTransactionCalls } from '../../../src/transaction-model/find-calls.js';

describe('findTransactionCalls', () => {
  it('extracts makeContractCall identity from an inline options literal', () => {
    const calls = findTransactionCalls(
      parseSnippet(
        `makeContractCall({ contractAddress: 'SP123', contractName: 'token', functionName: 'transfer' });`,
      ),
    );
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      kind: 'makeContractCall',
      callee: 'makeContractCall',
      functionName: 'transfer',
      contractId: 'SP123.token',
    });
    expect(calls[0]?.options.resolved).toBe(true);
  });

  it('extracts stx_callContract identity from the combined contract id', () => {
    const calls = findTransactionCalls(
      parseSnippet(`request('stx_callContract', { contract: 'SP123.token', functionName: 'swap' });`),
    );
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      kind: 'stx_callContract',
      functionName: 'swap',
      contractId: 'SP123.token',
    });
  });

  it('recognizes the request(options, method, params) overload', () => {
    const calls = findTransactionCalls(
      parseSnippet(`request({}, 'stx_callContract', { contract: 'SP1.c', functionName: 'pay' });`),
    );
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      kind: 'stx_callContract',
      contractId: 'SP1.c',
      functionName: 'pay',
    });
  });

  it('captures broadcastTransaction without a transfer identity', () => {
    const calls = findTransactionCalls(parseSnippet(`broadcastTransaction({ transaction: tx });`));
    expect(calls).toHaveLength(1);
    expect(calls[0]?.kind).toBe('broadcastTransaction');
    expect(calls[0]?.functionName).toBeUndefined();
    expect(calls[0]?.contractId).toBeUndefined();
  });

  it('matches a namespace-style callee by its method name', () => {
    const calls = findTransactionCalls(
      parseSnippet(`tx.makeContractCall({ functionName: 'transfer' });`),
    );
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      kind: 'makeContractCall',
      callee: 'tx.makeContractCall',
      functionName: 'transfer',
    });
  });

  it('ignores unrelated calls and non-matching request methods', () => {
    const calls = findTransactionCalls(
      parseSnippet(`doSomething();\nrequest('stx_signMessage', { message: 'hi' });`),
    );
    expect(calls).toHaveLength(0);
  });

  it('resolves options declared as a single same-file const', () => {
    const calls = findTransactionCalls(
      parseSnippet(
        `const opts = { contractAddress: 'SP9', contractName: 'c', functionName: 'donate' };\nmakeContractCall(opts);`,
      ),
    );
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ functionName: 'donate', contractId: 'SP9.c' });
    expect(calls[0]?.options.resolved).toBe(true);
  });

  it('leaves identity undefined when options cannot be resolved', () => {
    const calls = findTransactionCalls(parseSnippet(`makeContractCall(buildOptions());`));
    expect(calls).toHaveLength(1);
    expect(calls[0]?.options.resolved).toBe(false);
    expect(calls[0]?.functionName).toBeUndefined();
  });

  it('reports the 1-based location of each call', () => {
    const calls = findTransactionCalls(
      parseSnippet('const a = 1;\nmakeContractCall({ functionName: "transfer" });\n'),
    );
    expect(calls[0]?.location).toMatchObject({ file: 'snippet.ts', line: 2 });
  });
});
