import { describe, expect, it } from 'vitest';
import { selectReporter } from '../../../src/report/select-reporter.js';
import { summarizeFindings, type ReportFormat } from '../../../src/report/report-model.js';

describe('selectReporter', () => {
  it('returns the terminal formatter', () => {
    const reporter = selectReporter('terminal');
    expect(reporter(summarizeFindings([], 1))).toContain('No issues found');
  });

  it('returns the markdown formatter', () => {
    const reporter = selectReporter('markdown');
    expect(reporter(summarizeFindings([], 1))).toContain('# stx-tx-guard report');
  });

  it('returns the json formatter', () => {
    const reporter = selectReporter('json');
    expect(JSON.parse(reporter(summarizeFindings([], 1))).version).toBe(1);
  });

  it('throws for an unknown format', () => {
    expect(() => selectReporter('xml' as ReportFormat)).toThrow(/not available/i);
  });
});
