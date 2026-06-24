import { formatJsonReport } from './json-report.js';
import { formatMarkdownReport } from './markdown-report.js';
import type { ReportFormat, ScanResult } from './report-model.js';
import { formatTerminalReport } from './terminal-report.js';

/** Turns a scan result into the printable text for one report format. */
export type Reporter = (result: ScanResult) => string;

const REPORTERS: Partial<Record<ReportFormat, Reporter>> = {
  terminal: (result) => formatTerminalReport(result),
  markdown: (result) => formatMarkdownReport(result),
  json: (result) => formatJsonReport(result),
};

/**
 * Resolves a report format name to its formatter. Only the formats wired in
 * this version are available; selecting one that has not shipped yet (markdown
 * before M2, json before M3) raises a clear error rather than failing silently.
 */
export function selectReporter(format: ReportFormat): Reporter {
  const reporter = REPORTERS[format];
  if (!reporter) {
    throw new Error(`The "${format}" report format is not available in this version; use "terminal".`);
  }
  return reporter;
}
