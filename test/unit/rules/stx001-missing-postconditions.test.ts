import { describe, expect, it } from 'vitest';
import { stx001MissingPostConditions } from '../../../src/rules/stx001-missing-postconditions.js';
import { runCallRule } from '../../support/run-rule.js';

const SBTC = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token';

describe('STX001 missing post-conditions', () => {
  it('fires on a transfer-like call with no postConditions property', () => {
    const findings = runCallRule(
      stx001MissingPostConditions,
      `makeContractCall({ functionName: 'transfer' });`,
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: 'STX001', severity: 'error' });
  });

  it('fires when the matched asset contract is the only transfer signal', () => {
    const findings = runCallRule(
      stx001MissingPostConditions,
      `makeContractCall({ contractAddress: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4', contractName: 'sbtc-token', functionName: 'getBalance' });`,
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]?.ruleId).toBe('STX001');
  });

  it('does not fire when post-conditions are present', () => {
    const findings = runCallRule(
      stx001MissingPostConditions,
      `makeContractCall({ functionName: 'transfer', postConditions: [Pc.principal(addr).willSendEq(1n).ft('${SBTC}', 'sbtc')] });`,
    );
    expect(findings).toEqual([]);
  });

  it('does not fire when post-conditions are an empty array (left to STX002)', () => {
    const findings = runCallRule(
      stx001MissingPostConditions,
      `makeContractCall({ functionName: 'transfer', postConditions: [] });`,
    );
    expect(findings).toEqual([]);
  });

  it('does not fire on a non-transfer call', () => {
    const findings = runCallRule(
      stx001MissingPostConditions,
      `makeContractCall({ functionName: 'getBalance' });`,
    );
    expect(findings).toEqual([]);
  });

  it('does not fire when options cannot be resolved', () => {
    const findings = runCallRule(stx001MissingPostConditions, `makeContractCall(buildOptions());`);
    expect(findings).toEqual([]);
  });
});
