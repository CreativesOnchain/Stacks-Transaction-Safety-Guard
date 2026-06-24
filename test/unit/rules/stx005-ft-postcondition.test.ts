import { describe, expect, it } from 'vitest';
import { stx005FtPostCondition } from '../../../src/rules/stx005-ft-postcondition.js';
import { runCallRule } from '../../support/run-rule.js';

const SBTC_ADDR = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4';
const SBTC = `${SBTC_ADDR}.sbtc-token`;

/** A makeContractCall against the configured sBTC contract with the given postConditions text. */
function sbtcCall(postConditions: string): string {
  return `makeContractCall({ contractAddress: '${SBTC_ADDR}', contractName: 'sbtc-token', functionName: 'transfer', postConditions: ${postConditions} });`;
}

describe('STX005 fungible-token post-condition', () => {
  it('fires when an sBTC transfer has present post-conditions but no FT condition', () => {
    const findings = runCallRule(stx005FtPostCondition, sbtcCall(`[Pc.principal(addr).willSendEq(1n).ustx()]`));
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: 'STX005', severity: 'error' });
  });

  it('does not fire when an FT condition is present', () => {
    const findings = runCallRule(
      stx005FtPostCondition,
      sbtcCall(`[Pc.principal(addr).willSendEq(1n).ft('${SBTC}', 'sbtc')]`),
    );
    expect(findings).toEqual([]);
  });

  it('does not fire when post-conditions are absent (left to STX001)', () => {
    const findings = runCallRule(
      stx005FtPostCondition,
      `makeContractCall({ contractAddress: '${SBTC_ADDR}', contractName: 'sbtc-token', functionName: 'transfer' });`,
    );
    expect(findings).toEqual([]);
  });

  it('does not fire for a non-asset contract lacking an FT condition', () => {
    const findings = runCallRule(
      stx005FtPostCondition,
      `makeContractCall({ contractAddress: 'SP1', contractName: 'x', functionName: 'transfer', postConditions: [Pc.principal(a).willSendEq(1n).ustx()] });`,
    );
    expect(findings).toEqual([]);
  });

  it('treats an opaque post-condition array as satisfying (no false positive)', () => {
    expect(runCallRule(stx005FtPostCondition, sbtcCall(`[serializedPc]`))).toEqual([]);
  });
});
