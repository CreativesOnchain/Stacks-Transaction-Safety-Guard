import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadConfig } from '../config/load-config.js';
import type { ResolvedConfig } from '../config/config-schema.js';
import { analyzeFiles } from '../engine/run-analysis.js';
import { exitCodeFor } from '../exit/exit-code.js';
import { summarizeFindings, type ScanResult } from '../report/report-model.js';
import { selectReporter } from '../report/select-reporter.js';
import { discoverFiles } from '../sources/discover-files.js';
import type { SuppressionNotice } from '../suppression/apply-suppression.js';
import type { ScanCommand } from './parse-args.js';

/** Raised for a user-facing scan problem (e.g. a path that does not exist). */
export class ScanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScanError';
  }
}

/** Everything a run produces: the structured result, its rendered report, notices, and exit code. */
export interface ScanOutcome {
  result: ScanResult;
  report: string;
  notices: SuppressionNotice[];
  exitCode: number;
}

/**
 * Runs one scan end to end: load config, resolve the files under the target
 * path, analyze them, then summarize, format, and compute the Model A exit code.
 * Returns the outcome (including any suppression notices) without touching
 * stdout or the process exit code so it can be unit-tested; {@link ./bin.ts}
 * performs that IO.
 */
export function runScan(command: ScanCommand): ScanOutcome {
  const config = loadConfig({ ...(command.configPath !== undefined && { configPath: command.configPath }) });
  const files = resolveTargets(command.path, config);
  const { findings, notices } = analyzeFiles({ files, config, strict: command.strict });
  const result = summarizeFindings(findings, files.length);
  const report = selectReporter(command.report)(result);
  return { result, report, notices, exitCode: exitCodeFor(result) };
}

/**
 * Expands the target path into the list of files to scan: a single file is
 * scanned directly; a directory is treated as the scan root, with the config's
 * include/exclude globs applied within it.
 */
function resolveTargets(targetPath: string, config: ResolvedConfig): string[] {
  const absolute = resolve(targetPath);
  let stats;
  try {
    stats = statSync(absolute);
  } catch {
    throw new ScanError(`Path not found: ${targetPath}`);
  }
  if (stats.isFile()) return [absolute];
  return discoverFiles({
    root: absolute,
    include: config.scan.include,
    exclude: config.scan.exclude,
  });
}
