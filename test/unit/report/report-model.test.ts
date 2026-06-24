import { describe, expect, it } from 'vitest';
import { summarizeFindings } from '../../../src/report/report-model.js';
import type { Finding } from '../../../src/diagnostics/finding.js';

const location = { file: 'a.ts', line: 1, column: 1 };

function finding(over: Partial<Finding>): Finding {
  return { ruleId: 'STX001', severity: 'error', message: 'm', location, suggestion: 'fix', ...over };
}

describe('summarizeFindings', () => {
  it('counts errors and warnings separately', () => {
    const result = summarizeFindings(
      [
        finding({ severity: 'error' }),
        finding({ severity: 'warn', ruleId: 'STX004' }),
        finding({ severity: 'error', ruleId: 'STX003' }),
      ],
      3,
    );
    expect(result.summary).toEqual({ errors: 2, warnings: 1, filesScanned: 3 });
    expect(result.findings).toHaveLength(3);
  });

  it('reports zero counts for a clean scan', () => {
    expect(summarizeFindings([], 5).summary).toEqual({ errors: 0, warnings: 0, filesScanned: 5 });
  });
});
