import { describe, expect, it } from 'vitest';
import { stx006StxNftPostCondition } from '../../../src/rules/stx006-stx-nft-postcondition.js';
import type { ResolvedConfig } from '../../../src/config/config-schema.js';
import { DEFAULT_CONFIG } from '../../../src/config/default-config.js';
import { runCallRule } from '../../support/run-rule.js';

const STX_POOL = 'SP1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0.pool';
const NFT_COLL = 'SP2BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB0.art';

/** Adds STX- and NFT-typed asset contracts so STX006 has something to match. */
const config: ResolvedConfig = {
  ...DEFAULT_CONFIG,
  assetContracts: {
    ...DEFAULT_CONFIG.assetContracts,
    pool: { type: 'stx', contract: STX_POOL, transferFunctions: [] },
    art: { type: 'nft', contract: NFT_COLL, transferFunctions: [] },
  },
};

function callTo(contract: string, postConditions: string): string {
  const [address, name] = contract.split('.');
  return `makeContractCall({ contractAddress: '${address}', contractName: '${name}', functionName: 'deposit', postConditions: ${postConditions} });`;
}

describe('STX006 STX/NFT post-condition', () => {
  it('fires (warn) when an STX-moving call lacks an STX post-condition', () => {
    const findings = runCallRule(
      stx006StxNftPostCondition,
      callTo(STX_POOL, `[Pc.principal(a).willSendEq(1n).ft('SP.tok', 't')]`),
      config,
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: 'STX006', severity: 'warn' });
  });

  it('does not fire when the STX condition is present', () => {
    const findings = runCallRule(
      stx006StxNftPostCondition,
      callTo(STX_POOL, `[Pc.principal(a).willSendEq(1n).ustx()]`),
      config,
    );
    expect(findings).toEqual([]);
  });

  it('fires when an NFT-moving call lacks an NFT post-condition', () => {
    const findings = runCallRule(
      stx006StxNftPostCondition,
      callTo(NFT_COLL, `[Pc.principal(a).willSendEq(1n).ustx()]`),
      config,
    );
    expect(findings[0]?.ruleId).toBe('STX006');
  });

  it('does not fire when the NFT condition is present', () => {
    const findings = runCallRule(
      stx006StxNftPostCondition,
      callTo(NFT_COLL, `[Pc.principal(a).willSendAsset().nft('SP.coll::art', idCv)]`),
      config,
    );
    expect(findings).toEqual([]);
  });

  it('does not fire when post-conditions are absent (left to STX001)', () => {
    const [address, name] = STX_POOL.split('.');
    const findings = runCallRule(
      stx006StxNftPostCondition,
      `makeContractCall({ contractAddress: '${address}', contractName: '${name}', functionName: 'deposit' });`,
      config,
    );
    expect(findings).toEqual([]);
  });

  it('does not fire for a SIP-010 asset (left to STX005)', () => {
    const findings = runCallRule(
      stx006StxNftPostCondition,
      `makeContractCall({ contractAddress: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4', contractName: 'sbtc-token', functionName: 'transfer', postConditions: [Pc.principal(a).willSendEq(1n).ustx()] });`,
      config,
    );
    expect(findings).toEqual([]);
  });
});
