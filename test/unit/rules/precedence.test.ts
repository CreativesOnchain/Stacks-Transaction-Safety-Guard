import { describe, expect, it } from 'vitest';
import { analyzeSource } from '../../../src/engine/run-analysis.js';
import { DEFAULT_CONFIG } from '../../../src/config/default-config.js';
import { parseSnippet } from '../../support/parse-snippet.js';

const SBTC_ADDR = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4';

/** Rule ids fired by the full canonical rule set for an sBTC transfer with the given postConditions. */
function ruleIds(postConditions: string): string[] {
  const code = `makeContractCall({ contractAddress: '${SBTC_ADDR}', contractName: 'sbtc-token', functionName: 'transfer', postConditionMode: PostConditionMode.Deny, postConditions: ${postConditions} });`;
  return analyzeSource({ source: parseSnippet(code), config: DEFAULT_CONFIG, strict: false }).findings.map((f) => f.ruleId);
}

describe('post-condition rule precedence (no double-flagging)', () => {
  it('absent post-conditions → STX001 only', () => {
    const code = `makeContractCall({ contractAddress: '${SBTC_ADDR}', contractName: 'sbtc-token', functionName: 'transfer', postConditionMode: PostConditionMode.Deny });`;
    const ids = analyzeSource({ source: parseSnippet(code), config: DEFAULT_CONFIG, strict: false }).findings.map((f) => f.ruleId);
    expect(ids).toEqual(['STX001']);
  });

  it('empty post-conditions → STX002 only', () => {
    expect(ruleIds('[]')).toEqual(['STX002']);
  });

  it('present array without an FT condition → STX005 only', () => {
    expect(ruleIds('[Pc.principal(a).willSendEq(1n).ustx()]')).toEqual(['STX005']);
  });

  it('present array with an FT condition → no post-condition findings', () => {
    expect(ruleIds(`[Pc.principal(a).willSendEq(1n).ft('${SBTC_ADDR}.sbtc-token', 'sbtc')]`)).toEqual([]);
  });
});
