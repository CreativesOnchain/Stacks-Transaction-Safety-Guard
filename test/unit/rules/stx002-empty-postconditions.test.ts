import { describe, expect, it } from 'vitest';
import { stx002EmptyPostConditions } from '../../../src/rules/stx002-empty-postconditions.js';
import { runCallRule } from '../../support/run-rule.js';

describe('STX002 empty post-conditions', () => {
  it('fires on a transfer-like call with an empty postConditions array', () => {
    const findings = runCallRule(
      stx002EmptyPostConditions,
      `makeContractCall({ functionName: 'transfer', postConditions: [] });`,
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: 'STX002', severity: 'error' });
  });

  it('does not fire when post-conditions are absent (left to STX001)', () => {
    const findings = runCallRule(
      stx002EmptyPostConditions,
      `makeContractCall({ functionName: 'transfer' });`,
    );
    expect(findings).toEqual([]);
  });

  it('does not fire when post-conditions are present', () => {
    const findings = runCallRule(
      stx002EmptyPostConditions,
      `makeContractCall({ functionName: 'transfer', postConditions: [Pc.principal(a).willSendEq(1n).ustx()] });`,
    );
    expect(findings).toEqual([]);
  });

  it('does not fire on a non-transfer call with an empty array', () => {
    const findings = runCallRule(
      stx002EmptyPostConditions,
      `makeContractCall({ functionName: 'getBalance', postConditions: [] });`,
    );
    expect(findings).toEqual([]);
  });
});
