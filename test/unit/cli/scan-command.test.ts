import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runScan, ScanError } from '../../../src/cli/scan-command.js';
import type { ScanCommand } from '../../../src/cli/parse-args.js';
import { fixturePath } from '../../support/load-fixture.js';

const examplesRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../examples');

function command(over: Partial<ScanCommand> & { path: string }): ScanCommand {
  return { report: 'terminal', strict: false, ...over };
}

describe('runScan', () => {
  it('passes the no-transfer example with exit 0 and no findings', () => {
    const outcome = runScan(command({ path: resolve(examplesRoot, 'no-transfer-contract-call') }));
    expect(outcome.exitCode).toBe(0);
    expect(outcome.result.summary.errors).toBe(0);
    expect(outcome.result.findings).toHaveLength(0);
    expect(outcome.report).toContain('No issues found');
  });

  it('fails the unsafe example with exit 1 and STX001 in the report', () => {
    const outcome = runScan(command({ path: resolve(examplesRoot, 'unsafe-contract-call') }));
    expect(outcome.exitCode).toBe(1);
    expect(outcome.result.findings.map((f) => f.ruleId)).toContain('STX001');
    expect(outcome.report).toContain('STX001');
  });

  it('escalates a warning-only file to a failure under --strict', () => {
    const target = { path: fixturePath('scan/warn-only.ts') };
    expect(runScan(command(target)).exitCode).toBe(0);

    const strict = runScan(command({ ...target, strict: true }));
    expect(strict.exitCode).toBe(1);
    expect(strict.result.findings.map((f) => f.ruleId)).toContain('STX004');
  });

  it('raises a ScanError for a path that does not exist', () => {
    expect(() => runScan(command({ path: resolve(examplesRoot, 'does-not-exist') }))).toThrow(ScanError);
  });
});
