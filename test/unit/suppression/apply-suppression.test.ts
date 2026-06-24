import { describe, expect, it } from 'vitest';
import { applySuppression } from '../../../src/suppression/apply-suppression.js';
import type { SuppressionDirective } from '../../../src/suppression/parse-directives.js';
import type { Finding } from '../../../src/diagnostics/finding.js';

const FILE = 'src/pay.ts';

function finding(over: Partial<Finding> & { line: number }): Finding {
  const { line, ...rest } = over;
  return {
    ruleId: 'STX001',
    severity: 'error',
    message: 'm',
    suggestion: 'fix',
    location: { file: FILE, line, column: 1 },
    ...rest,
  };
}

function directive(over: Partial<SuppressionDirective>): SuppressionDirective {
  return { ruleIds: ['STX001'], line: 1, reason: 'reviewed', ...over };
}

describe('applySuppression', () => {
  it('suppresses a finding on the line after a justified directive', () => {
    const result = applySuppression([finding({ line: 2 })], [directive({})], FILE);
    expect(result.findings).toEqual([]);
    expect(result.notices).toEqual([]);
  });

  it('does not suppress when the directive has no reason, and emits a notice', () => {
    const result = applySuppression([finding({ line: 2 })], [directive({ reason: '' })], FILE);
    expect(result.findings).toHaveLength(1);
    expect(result.notices).toHaveLength(1);
    expect(result.notices[0]?.location).toEqual({ file: FILE, line: 1, column: 1 });
  });

  it('does not suppress a finding whose rule id the directive does not list', () => {
    const result = applySuppression(
      [finding({ line: 2, ruleId: 'STX001' })],
      [directive({ ruleIds: ['STX003'] })],
      FILE,
    );
    expect(result.findings).toHaveLength(1);
  });

  it('does not suppress a finding that is not on the targeted next line', () => {
    const result = applySuppression([finding({ line: 3 })], [directive({ line: 1 })], FILE);
    expect(result.findings).toHaveLength(1);
  });

  it('suppresses any of the rule ids listed in one directive', () => {
    const result = applySuppression(
      [finding({ line: 2, ruleId: 'STX001' }), finding({ line: 2, ruleId: 'STX004' })],
      [directive({ ruleIds: ['STX001', 'STX004'] })],
      FILE,
    );
    expect(result.findings).toEqual([]);
  });

  it('keeps findings when there are no directives', () => {
    const result = applySuppression([finding({ line: 2 })], [], FILE);
    expect(result.findings).toHaveLength(1);
  });
});
