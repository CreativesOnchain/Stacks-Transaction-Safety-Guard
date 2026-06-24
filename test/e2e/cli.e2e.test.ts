import { execFileSync, execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const binary = resolve(repoRoot, 'dist/cli/bin.js');

interface CliRun {
  status: number;
  stdout: string;
}

/** Runs the built CLI as a subprocess and captures its exit status and stdout. */
function runCli(args: string[]): CliRun {
  try {
    const stdout = execFileSync('node', [binary, ...args], { cwd: repoRoot, encoding: 'utf8' });
    return { status: 0, stdout };
  } catch (error) {
    const failure = error as { status?: number; stdout?: Buffer | string };
    return { status: failure.status ?? 1, stdout: String(failure.stdout ?? '') };
  }
}

describe('stx-tx-guard CLI (e2e)', () => {
  beforeAll(() => {
    execSync('npm run build', { cwd: repoRoot, stdio: 'ignore' });
  }, 120_000);

  it('exits 0 with no findings on the no-transfer example', () => {
    const run = runCli(['scan', 'examples/no-transfer-contract-call']);
    expect(run.status).toBe(0);
    expect(run.stdout).toContain('No issues found');
  });

  it('exits 1 and reports STX001 on the unsafe example', () => {
    const run = runCli(['scan', 'examples/unsafe-contract-call']);
    expect(run.status).toBe(1);
    expect(run.stdout).toContain('STX001');
  });

  it('escalates warnings to failure under --strict', () => {
    const lenient = runCli(['scan', 'test/fixtures/scan/warn-only.ts']);
    expect(lenient.status).toBe(0);

    const strict = runCli(['scan', 'test/fixtures/scan/warn-only.ts', '--strict']);
    expect(strict.status).toBe(1);
    expect(strict.stdout).toContain('STX004');
  });

  it('fails the unsafe sBTC demo with STX005 and STX007', () => {
    const run = runCli(['scan', 'examples/unsafe-sbtc-transfer']);
    expect(run.status).toBe(1);
    expect(run.stdout).toContain('STX005');
    expect(run.stdout).toContain('STX007');
  });

  it('passes the safe sBTC demo', () => {
    const run = runCli(['scan', 'examples/safe-sbtc-transfer']);
    expect(run.status).toBe(0);
    expect(run.stdout).toContain('No issues found');
  });

  it('emits a Markdown table with --report markdown', () => {
    const run = runCli(['scan', 'examples/unsafe-sbtc-transfer', '--report', 'markdown']);
    expect(run.status).toBe(1);
    expect(run.stdout).toContain('# stx-tx-guard report');
    expect(run.stdout).toContain('| File | Line | Rule | Severity | Issue | Fix |');
    expect(run.stdout).toContain('STX005');
  });

  it('emits JSON whose strict-mode counts and exit code follow Model A', () => {
    const lenient = runCli(['scan', 'test/fixtures/scan/warn-only.ts', '--report', 'json']);
    expect(lenient.status).toBe(0);
    const lenientReport = JSON.parse(lenient.stdout);
    expect(lenientReport.version).toBe(1);
    expect(lenientReport.summary).toMatchObject({ errors: 0, warnings: 1 });

    const strict = runCli(['scan', 'test/fixtures/scan/warn-only.ts', '--strict', '--report', 'json']);
    expect(strict.status).toBe(1);
    expect(JSON.parse(strict.stdout).summary).toMatchObject({ errors: 1, warnings: 0 });
  });

  // Mirrors the .github/workflows/tx-guard.yml strict scans so CI behavior is regression-tested.
  it('matches the example workflow: safe demos pass and the unsafe demo fails under --strict', () => {
    const strict = (example: string): number =>
      runCli(['scan', `examples/${example}`, '--strict', '--report', 'markdown']).status;
    expect(strict('safe-sbtc-transfer')).toBe(0);
    expect(strict('no-transfer-contract-call')).toBe(0);
    expect(strict('unsafe-sbtc-transfer')).toBe(1);
  });
});
