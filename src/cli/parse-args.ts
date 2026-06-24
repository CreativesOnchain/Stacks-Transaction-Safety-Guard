import { readFileSync } from 'node:fs';
import { Command, InvalidArgumentError } from 'commander';
import { REPORT_FORMATS, type ReportFormat } from '../report/report-model.js';

/**
 * The parsed `scan` invocation: a normalized, side-effect-free description of
 * what to scan and how, handed to {@link ../cli/scan-command.ts}.
 */
export interface ScanCommand {
  path: string;
  report: ReportFormat;
  strict: boolean;
  configPath?: string;
}

/** Callback invoked with the parsed command when `scan` runs. */
export type ScanRunner = (command: ScanCommand) => void | Promise<void>;

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

function parseReportFormat(value: string): ReportFormat {
  if ((REPORT_FORMATS as readonly string[]).includes(value)) return value as ReportFormat;
  throw new InvalidArgumentError(`Expected one of: ${REPORT_FORMATS.join(', ')}.`);
}

interface ScanOptions {
  report: ReportFormat;
  strict: boolean;
  config?: string;
}

/**
 * Builds the command-line interface. Kept free of process side effects (no argv
 * parsing, no exit calls) so it can be constructed and inspected in tests; the
 * `scan` action maps the parsed options into a {@link ScanCommand} and hands it
 * to `onScan`. {@link ./bin.ts} is the only entry point that drives it.
 */
export function createProgram(onScan?: ScanRunner): Command {
  const program = new Command();

  program
    .name('stx-tx-guard')
    .description('Post-condition safety checks for Stacks.js and Stacks Connect transaction code')
    .version(readPackageVersion());

  program
    .command('scan')
    .argument('<path>', 'directory or file to scan')
    .option('--report <format>', `report format: ${REPORT_FORMATS.join(', ')}`, parseReportFormat, 'terminal')
    .option('--strict', 'treat warnings as errors so they fail CI', false)
    .option('--config <path>', 'path to a configuration file')
    .description('scan transaction-building code for unsafe post-condition patterns')
    .action(async (path: string, options: ScanOptions) => {
      const command: ScanCommand = {
        path,
        report: options.report,
        strict: options.strict,
        ...(options.config !== undefined && { configPath: options.config }),
      };
      await onScan?.(command);
    });

  return program;
}
