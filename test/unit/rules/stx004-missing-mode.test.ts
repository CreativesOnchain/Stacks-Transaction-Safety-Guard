import { describe, expect, it } from 'vitest';
import { stx004MissingMode } from '../../../src/rules/stx004-missing-mode.js';
import { runCallRule } from '../../support/run-rule.js';

describe('STX004 missing mode', () => {
  it('fires (warn) on a transfer-like call with no postConditionMode', () => {
    const findings = runCallRule(
      stx004MissingMode,
      `makeContractCall({ functionName: 'transfer' });`,
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: 'STX004', severity: 'warn' });
  });

  it('does not fire when the mode is set to Deny', () => {
    const findings = runCallRule(
      stx004MissingMode,
      `makeContractCall({ functionName: 'transfer', postConditionMode: PostConditionMode.Deny });`,
    );
    expect(findings).toEqual([]);
  });

  it('does not fire when the mode is set to Allow (left to STX003)', () => {
    const findings = runCallRule(
      stx004MissingMode,
      `makeContractCall({ functionName: 'transfer', postConditionMode: 'allow' });`,
    );
    expect(findings).toEqual([]);
  });

  it('does not fire on a non-transfer call', () => {
    const findings = runCallRule(
      stx004MissingMode,
      `makeContractCall({ functionName: 'getBalance' });`,
    );
    expect(findings).toEqual([]);
  });
});
