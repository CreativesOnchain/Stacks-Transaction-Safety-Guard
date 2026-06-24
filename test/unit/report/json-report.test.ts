import { describe, expect, it } from 'vitest';
import { formatJsonReport, JSON_REPORT_VERSION } from '../../../src/report/json-report.js';
import { summarizeFindings } from '../../../src/report/report-model.js';
import type { Finding } from '../../../src/diagnostics/finding.js';

const finding: Finding = {
  ruleId: 'STX005',
  severity: 'error',
  message: 'no fungible-token condition',
  location: { file: 'src/pay.ts', line: 12, column: 3 },
  suggestion: 'add a Pc(...).ft(...) post-condition',
};

describe('formatJsonReport', () => {
  it('emits the documented schema', () => {
    const report = JSON.parse(formatJsonReport(summarizeFindings([finding], 1)));
    expect(report).toEqual({
      version: JSON_REPORT_VERSION,
      summary: { errors: 1, warnings: 0, filesScanned: 1 },
      findings: [
        {
          ruleId: 'STX005',
          severity: 'error',
          message: 'no fungible-token condition',
          location: { file: 'src/pay.ts', line: 12, column: 3 },
          suggestion: 'add a Pc(...).ft(...) post-condition',
        },
      ],
    });
  });

  it('emits an empty findings array and zero counts for a clean scan', () => {
    const report = JSON.parse(formatJsonReport(summarizeFindings([], 4)));
    expect(report.findings).toEqual([]);
    expect(report.summary).toEqual({ errors: 0, warnings: 0, filesScanned: 4 });
  });

  it('produces valid, re-parseable JSON', () => {
    expect(() => JSON.parse(formatJsonReport(summarizeFindings([finding], 1)))).not.toThrow();
  });
});
