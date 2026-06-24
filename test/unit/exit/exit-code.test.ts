import { describe, expect, it } from 'vitest';
import { exitCodeFor } from '../../../src/exit/exit-code.js';
import type { ScanResult } from '../../../src/report/report-model.js';

function result(errors: number, warnings: number): ScanResult {
  return { findings: [], summary: { errors, warnings, filesScanned: 1 } };
}

describe('exitCodeFor (Model A)', () => {
  it('exits 1 when there is any error', () => {
    expect(exitCodeFor(result(1, 0))).toBe(1);
  });

  it('exits 0 when there are only warnings', () => {
    expect(exitCodeFor(result(0, 3))).toBe(0);
  });

  it('exits 0 for a clean scan', () => {
    expect(exitCodeFor(result(0, 0))).toBe(0);
  });
});
