import { describe, expect, it } from 'vitest';
import { findSenderKeyUsages } from '../../../src/transaction-model/read-senderkey.js';
import { parseSnippet } from '../../support/parse-snippet.js';

describe('findSenderKeyUsages', () => {
  it('finds a senderKey property assignment', () => {
    const usages = findSenderKeyUsages(parseSnippet(`makeContractCall({ senderKey: process.env.KEY });`));
    expect(usages).toHaveLength(1);
    expect(usages[0]?.location).toMatchObject({ file: 'snippet.ts', line: 1 });
  });

  it('finds a shorthand senderKey property', () => {
    expect(findSenderKeyUsages(parseSnippet(`const o = { senderKey };`))).toHaveLength(1);
  });

  it('finds multiple senderKey usages across the file', () => {
    const usages = findSenderKeyUsages(
      parseSnippet('const a = { senderKey: k1 };\nconst b = { senderKey: k2 };\n'),
    );
    expect(usages).toHaveLength(2);
    expect(usages.map((usage) => usage.location.line)).toEqual([1, 2]);
  });

  it('returns nothing when senderKey is absent', () => {
    expect(findSenderKeyUsages(parseSnippet(`makeContractCall({ functionName: 'transfer' });`))).toHaveLength(
      0,
    );
  });
});
