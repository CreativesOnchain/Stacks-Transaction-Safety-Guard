import { describe, expect, it } from 'vitest';
import { parseDirectives } from '../../../src/suppression/parse-directives.js';
import { parseSnippet } from '../../support/parse-snippet.js';

describe('parseDirectives', () => {
  it('parses a single rule id and reason, targeting the next line', () => {
    const directives = parseDirectives(
      parseSnippet(`// stx-tx-guard-disable-next-line STX001 -- amount is fixed\nmakeContractCall({});`),
    );
    expect(directives).toEqual([{ ruleIds: ['STX001'], line: 1, reason: 'amount is fixed' }]);
  });

  it('parses multiple rule ids in one directive', () => {
    const [directive] = parseDirectives(
      parseSnippet(`// stx-tx-guard-disable-next-line STX001, STX004 -- reviewed`),
    );
    expect(directive?.ruleIds).toEqual(['STX001', 'STX004']);
  });

  it('captures an empty reason when none is given', () => {
    const [directive] = parseDirectives(parseSnippet(`// stx-tx-guard-disable-next-line STX003`));
    expect(directive).toMatchObject({ ruleIds: ['STX003'], reason: '' });
  });

  it('treats a reason of only whitespace as empty', () => {
    const [directive] = parseDirectives(parseSnippet(`// stx-tx-guard-disable-next-line STX003 --   `));
    expect(directive?.reason).toBe('');
  });

  it('ignores unknown rule ids and yields no directive when none remain', () => {
    expect(parseDirectives(parseSnippet(`// stx-tx-guard-disable-next-line STX999 -- nope`))).toEqual([]);
  });

  it('recognizes a trailing directive on a code line', () => {
    const [directive] = parseDirectives(
      parseSnippet(`const a = 1; // stx-tx-guard-disable-next-line STX007 -- test key`),
    );
    expect(directive).toMatchObject({ ruleIds: ['STX007'], line: 1, reason: 'test key' });
  });

  it('returns nothing when there is no directive', () => {
    expect(parseDirectives(parseSnippet(`const a = 1;`))).toEqual([]);
  });
});
