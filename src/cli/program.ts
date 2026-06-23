import { readFileSync } from 'node:fs';
import { Command } from 'commander';

interface PackageManifest {
  version: string;
}

/**
 * Reads the package version from the manifest at runtime so the CLI and the
 * published package report a single, authoritative version string.
 */
function readPackageVersion(): string {
  const manifestUrl = new URL('../../package.json', import.meta.url);
  const manifest = JSON.parse(readFileSync(manifestUrl, 'utf8')) as PackageManifest;
  return manifest.version;
}

/**
 * Builds the command-line interface. Kept free of process side effects (no
 * argument parsing, no exit calls) so it can be constructed and inspected in
 * tests; {@link ./bin.ts} is the only entry point that drives it against argv.
 */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('stx-tx-guard')
    .description('Post-condition safety checks for Stacks.js and Stacks Connect transaction code')
    .version(readPackageVersion());

  program
    .command('scan')
    .argument('<path>', 'directory or file to scan')
    .option('--report <format>', 'report format: terminal, markdown, or json', 'terminal')
    .option('--strict', 'treat warnings as errors so they fail CI', false)
    .option('--config <path>', 'path to a configuration file')
    .description('scan transaction-building code for unsafe post-condition patterns')
    .action(() => {
      throw new Error('The scan command is not implemented yet.');
    });

  return program;
}
