import type { Finding } from '../diagnostics/finding.js';
import { displayPath, type ScanResult, type ScanSummary } from './report-model.js';

/**
 * Schema version of the JSON report. It is independent of the package version and
 * is bumped only when the output shape changes, so machine consumers can pin to
 * a stable contract.
 */
export const JSON_REPORT_VERSION = 1;

/** The stable, machine-readable shape emitted by {@link formatJsonReport}. */
export interface JsonReport {
  version: number;
  summary: ScanSummary;
  findings: Finding[];
}

/**
 * Renders a scan result as pretty-printed JSON against a stable schema:
 * `{ version, summary, findings[] }`, each finding carrying its rule id,
 * effective severity, message, location, and suggestion. File paths are shown
 * relative to `cwd` so output is portable across machines.
 */
export function formatJsonReport(result: ScanResult, cwd: string = process.cwd()): string {
  const report: JsonReport = {
    version: JSON_REPORT_VERSION,
    summary: result.summary,
    findings: result.findings.map((finding) => serializeFinding(finding, cwd)),
  };
  return JSON.stringify(report, null, 2);
}

function serializeFinding(finding: Finding, cwd: string): Finding {
  return {
    ruleId: finding.ruleId,
    severity: finding.severity,
    message: finding.message,
    location: {
      file: displayPath(finding.location.file, cwd),
      line: finding.location.line,
      column: finding.location.column,
    },
    suggestion: finding.suggestion,
  };
}
