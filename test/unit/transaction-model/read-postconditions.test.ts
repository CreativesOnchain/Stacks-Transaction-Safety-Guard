import { describe, expect, it } from 'vitest';
import { readPostConditions } from '../../../src/transaction-model/read-postconditions.js';
import { optionsOf } from '../../support/extract-call.js';

const SATISFIED = { state: 'present', ftPresent: true, stxPresent: true, nftPresent: true };

describe('readPostConditions', () => {
  it('reports absent when there is no postConditions property', () => {
    expect(readPostConditions(optionsOf(`{ functionName: 'transfer' }`))).toEqual({
      state: 'absent',
      ftPresent: false,
      stxPresent: false,
      nftPresent: false,
    });
  });

  it('reports empty for an empty array literal', () => {
    expect(readPostConditions(optionsOf(`{ postConditions: [] }`))).toEqual({
      state: 'empty',
      ftPresent: false,
      stxPresent: false,
      nftPresent: false,
    });
  });

  it('detects an FT post-condition from a Pc .ft() terminal', () => {
    expect(
      readPostConditions(optionsOf(`{ postConditions: [Pc.principal('SP1').willSendEq(1).ft('SP1.tok', 'tok')] }`)),
    ).toEqual({ state: 'present', ftPresent: true, stxPresent: false, nftPresent: false });
  });

  it('detects an STX post-condition from a Pc .ustx() terminal', () => {
    expect(
      readPostConditions(optionsOf(`{ postConditions: [Pc.principal('SP1').willSendEq(1).ustx()] }`)),
    ).toEqual({ state: 'present', ftPresent: false, stxPresent: true, nftPresent: false });
  });

  it('detects an NFT post-condition from a Pc .nft() terminal', () => {
    expect(
      readPostConditions(optionsOf(`{ postConditions: [Pc.principal('SP1').willSendAsset().nft('SP1.col::id', idCV)] }`)),
    ).toEqual({ state: 'present', ftPresent: false, stxPresent: false, nftPresent: true });
  });

  it('records distinct asset classes across multiple post-conditions', () => {
    expect(
      readPostConditions(
        optionsOf(
          `{ postConditions: [Pc.principal('SP1').willSendEq(1).ft('SP1.tok','tok'), Pc.origin().willSendEq(1).ustx()] }`,
        ),
      ),
    ).toEqual({ state: 'present', ftPresent: true, stxPresent: true, nftPresent: false });
  });

  it('treats an opaque string entry as satisfying every asset class', () => {
    expect(readPostConditions(optionsOf(`{ postConditions: ['0c000000'] }`))).toEqual(SATISFIED);
  });

  it('treats a spread element as present and satisfying', () => {
    expect(readPostConditions(optionsOf(`{ postConditions: [...extra] }`))).toEqual(SATISFIED);
  });

  it('treats a non-literal (dynamic) array as present and satisfying', () => {
    expect(readPostConditions(optionsOf(`{ postConditions: buildConditions() }`))).toEqual(SATISFIED);
  });

  it('treats a shorthand postConditions property as present and satisfying', () => {
    expect(readPostConditions(optionsOf(`{ postConditions }`))).toEqual(SATISFIED);
  });

  it('does not classify a non-Pc terminal as an asset post-condition', () => {
    expect(readPostConditions(optionsOf(`{ postConditions: [helper.ft('a','b')] }`))).toEqual(SATISFIED);
  });

  it('returns a satisfying present result for unresolved options', () => {
    expect(readPostConditions({ resolved: false, reason: 'dynamic' })).toEqual(SATISFIED);
  });
});
