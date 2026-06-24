import { describe, expect, it } from 'vitest';
import { formatTerminalReport } from '../../../src/report/terminal-report.js';
import { summarizeFindings } from '../../../src/report/report-model.js';
import type { Finding } from '../../../src/diagnostics/finding.js';

const finding: Finding = {
  ruleId: 'STX001',
  severity: 'error',
  message: 'This asset-moving call declares no post-conditions.',
  location: { file: 'src/pay.ts', line: 12, column: 3 },
  suggestion: 'Add postConditions and set postConditionMode to Deny.',
};

describe('formatTerminalReport', () => {
  it('renders location, severity, rule id, message, and fix for each finding', () => {
    const out = formatTerminalReport(summarizeFindings([finding], 1));
    expect(out).toContain('src/pay.ts:12:3');
    expect(out).toContain('ERROR');
    expect(out).toContain('STX001');
    expect(out).toContain(finding.message);
    expect(out).toContain(`fix: ${finding.suggestion}`);
  });

  it('summarizes problem and file counts', () => {
    const warn: Finding = { ...finding, ruleId: 'STX004', severity: 'warn' };
    const out = formatTerminalReport(summarizeFindings([finding, warn], 2));
    expect(out).toContain('2 problems (1 error, 1 warning) in 2 files');
  });

  it('reports a clean scan without listing findings', () => {
    const out = formatTerminalReport(summarizeFindings([], 4));
    expect(out).toBe('✓ No issues found in 4 files.');
  });

  it('shows a directory-scoped path relative to the cwd', () => {
    const abs: Finding = { ...finding, location: { file: '/repo/src/pay.ts', line: 1, column: 1 } };
    const out = formatTerminalReport(summarizeFindings([abs], 1), '/repo');
    expect(out).toContain('src/pay.ts:1:1');
  });
});
