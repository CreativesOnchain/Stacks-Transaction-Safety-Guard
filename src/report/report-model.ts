import { isAbsolute, relative } from 'node:path';
import type { Finding } from '../diagnostics/finding.js';

/**
 * The report formats the CLI accepts. `terminal` ships in M1, `markdown` in M2,
 * and `json` in M3; {@link select-reporter} owns which are actually wired.
 */
export const REPORT_FORMATS = ['terminal', 'markdown', 'json'] as const;
export type ReportFormat = (typeof REPORT_FORMATS)[number];

/** Aggregate counts for a scan, surfaced in every report's summary line. */
export interface ScanSummary {
  errors: number;
  warnings: number;
  filesScanned: number;
}

/**
 * The complete result of a scan: every finding (already severity-resolved by the
 * engine) plus the run summary. All formatters consume this shape.
 */
export interface ScanResult {
  findings: Finding[];
  summary: ScanSummary;
}

/**
 * Builds a {@link ScanResult} from the findings collected across a run, counting
 * errors and warnings by effective severity.
 */
export function summarizeFindings(findings: Finding[], filesScanned: number): ScanResult {
  let errors = 0;
  let warnings = 0;
  for (const finding of findings) {
    if (finding.severity === 'error') errors += 1;
    else if (finding.severity === 'warn') warnings += 1;
  }
  return { findings, summary: { errors, warnings, filesScanned } };
}

/**
 * Shows a file path relative to `cwd` for readability, keeping it absolute when
 * it lies outside `cwd` or is already relative. Shared by every reporter.
 */
export function displayPath(file: string, cwd: string): string {
  if (!isAbsolute(file)) return file;
  const rel = relative(cwd, file);
  return rel === '' || rel.startsWith('..') ? file : rel;
}
