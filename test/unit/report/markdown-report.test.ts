import { describe, expect, it } from 'vitest';
import { formatMarkdownReport } from '../../../src/report/markdown-report.js';
import { summarizeFindings } from '../../../src/report/report-model.js';
import type { Finding } from '../../../src/diagnostics/finding.js';

const finding: Finding = {
  ruleId: 'STX005',
  severity: 'error',
  message: 'This call moves a SIP-010 token but its post-conditions include no fungible-token condition.',
  location: { file: 'src/pay.ts', line: 12, column: 3 },
  suggestion: 'Add a Pc(...).ft(...) post-condition for the token this call moves.',
};

describe('formatMarkdownReport', () => {
  it('renders a heading, summary, and a finding row', () => {
    const out = formatMarkdownReport(summarizeFindings([finding], 1));
    expect(out).toContain('# stx-tx-guard report');
    expect(out).toContain('| File | Line | Rule | Severity | Issue | Fix |');
    expect(out).toContain('`src/pay.ts`');
    expect(out).toContain('| 12 |');
    expect(out).toContain('STX005');
    expect(out).toContain('error');
    expect(out).toContain(finding.message);
    expect(out).toContain(finding.suggestion);
  });

  it('summarizes problem and file counts in bold', () => {
    const warn: Finding = { ...finding, ruleId: 'STX004', severity: 'warn' };
    const out = formatMarkdownReport(summarizeFindings([finding, warn], 2));
    expect(out).toContain('✖ **2 problems** (1 error, 1 warning) in 2 files.');
  });

  it('omits the table for a clean scan', () => {
    const out = formatMarkdownReport(summarizeFindings([], 3));
    expect(out).toContain('✓ No issues found in 3 files.');
    expect(out).not.toContain('| File |');
  });

  it('escapes a pipe in cell content', () => {
    const piped: Finding = { ...finding, message: 'a | b' };
    const out = formatMarkdownReport(summarizeFindings([piped], 1));
    expect(out).toContain('a \\| b');
  });
});
