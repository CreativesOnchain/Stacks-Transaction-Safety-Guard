import { describe, expect, it } from 'vitest';
import { createProgram } from '../../../src/cli/program.js';

describe('createProgram', () => {
  it('exposes the stx-tx-guard program with a semver version', () => {
    const program = createProgram();
    expect(program.name()).toBe('stx-tx-guard');
    expect(program.version()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('registers the scan command', () => {
    const program = createProgram();
    const commandNames = program.commands.map((command) => command.name());
    expect(commandNames).toContain('scan');
  });
});
