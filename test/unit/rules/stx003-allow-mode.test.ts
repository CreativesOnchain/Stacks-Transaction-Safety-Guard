import { describe, expect, it } from 'vitest';
import { stx003AllowMode } from '../../../src/rules/stx003-allow-mode.js';
import { runCallRule } from '../../support/run-rule.js';

describe('STX003 allow mode', () => {
  it('fires on the PostConditionMode.Allow enum form', () => {
    const findings = runCallRule(
      stx003AllowMode,
      `makeContractCall({ functionName: 'transfer', postConditionMode: PostConditionMode.Allow });`,
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: 'STX003', severity: 'error' });
  });

  it("fires on the 'allow' string form (Stacks Connect)", () => {
    const findings = runCallRule(
      stx003AllowMode,
      `request('stx_callContract', { contract: 'SP1.c', functionName: 'transfer', postConditionMode: 'allow' });`,
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]?.ruleId).toBe('STX003');
  });

  it('does not fire on Deny mode', () => {
    const findings = runCallRule(
      stx003AllowMode,
      `makeContractCall({ functionName: 'transfer', postConditionMode: PostConditionMode.Deny });`,
    );
    expect(findings).toEqual([]);
  });

  it('does not fire when the mode is missing (left to STX004)', () => {
    const findings = runCallRule(
      stx003AllowMode,
      `makeContractCall({ functionName: 'transfer' });`,
    );
    expect(findings).toEqual([]);
  });

  it('does not fire on a non-transfer call even in allow mode', () => {
    const findings = runCallRule(
      stx003AllowMode,
      `makeContractCall({ functionName: 'getBalance', postConditionMode: 'allow' });`,
    );
    expect(findings).toEqual([]);
  });
});
