import { describe, expect, it } from 'vitest';
import { stx007SenderKey } from '../../../src/rules/stx007-senderkey.js';
import { runFileRule } from '../../support/run-rule.js';

describe('STX007 senderKey', () => {
  it('fires on a senderKey property in transaction-building code', () => {
    const findings = runFileRule(
      stx007SenderKey,
      `makeContractCall({ functionName: 'transfer', senderKey: process.env.KEY });`,
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: 'STX007', severity: 'error' });
  });

  it('fires on a shorthand { senderKey } property', () => {
    const findings = runFileRule(stx007SenderKey, `const opts = { senderKey };`);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.ruleId).toBe('STX007');
  });

  it('fires once per usage regardless of transfer classification', () => {
    const findings = runFileRule(
      stx007SenderKey,
      `makeContractCall({ functionName: 'getBalance', senderKey: a });\nmakeContractCall({ functionName: 'transfer', senderKey: b });`,
    );
    expect(findings).toHaveLength(2);
  });

  it('does not fire when no senderKey is present', () => {
    const findings = runFileRule(stx007SenderKey, `makeContractCall({ functionName: 'transfer' });`);
    expect(findings).toEqual([]);
  });
});
