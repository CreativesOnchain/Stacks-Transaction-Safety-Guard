import { describe, expect, it } from 'vitest';
import { createProgram, type ScanCommand } from '../../../src/cli/parse-args.js';

/** Drives the program against argv and returns the ScanCommand the action received. */
async function parseScan(args: string[]): Promise<ScanCommand> {
  let captured: ScanCommand | undefined;
  const program = createProgram((command) => {
    captured = command;
  });
  // Make commander throw instead of calling process.exit, on the program and each
  // subcommand (exitOverride is per-command), and silence its error output.
  const noop = (): void => {};
  for (const command of [program, ...program.commands]) {
    command.exitOverride();
    command.configureOutput({ writeErr: noop, writeOut: noop });
  }
  await program.parseAsync(['node', 'stx-tx-guard', 'scan', ...args]);
  if (!captured) throw new Error('scan action did not run');
  return captured;
}

describe('createProgram', () => {
  it('exposes the stx-tx-guard program with a semver version', () => {
    const program = createProgram();
    expect(program.name()).toBe('stx-tx-guard');
    expect(program.version()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('registers the scan command', () => {
    const names = createProgram().commands.map((command) => command.name());
    expect(names).toContain('scan');
  });

  it('defaults report to terminal and strict to false', async () => {
    const command = await parseScan(['./src']);
    expect(command).toEqual({ path: './src', report: 'terminal', strict: false });
  });

  it('captures path, report, strict, and config', async () => {
    const command = await parseScan(['./app', '--report', 'markdown', '--strict', '--config', 'cfg.json']);
    expect(command).toEqual({
      path: './app',
      report: 'markdown',
      strict: true,
      configPath: 'cfg.json',
    });
  });

  it('rejects an unknown report format', async () => {
    await expect(parseScan(['./src', '--report', 'xml'])).rejects.toThrow(/Expected one of/);
  });
});
