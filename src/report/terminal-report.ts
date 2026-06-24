import type { Finding } from '../diagnostics/finding.js';
import { displayPath, type ScanResult, type ScanSummary } from './report-model.js';

/**
 * Renders a scan result as human-readable terminal text: one block per finding
 * (location, severity, rule id, message, and suggested fix) followed by a
 * summary line. File paths are shown relative to `cwd` for readability.
 */
export function formatTerminalReport(result: ScanResult, cwd: string = process.cwd()): string {
  const blocks = result.findings.map((finding) => formatFinding(finding, cwd));
  const summary = formatSummary(result.summary);
  return blocks.length > 0 ? `${blocks.join('\n')}\n\n${summary}` : summary;
}

function formatFinding(finding: Finding, cwd: string): string {
  const { file, line, column } = finding.location;
  const where = `${displayPath(file, cwd)}:${line}:${column}`;
  const head = `${where}  ${finding.severity.toUpperCase()}  ${finding.ruleId}  ${finding.message}`;
  return `${head}\n    fix: ${finding.suggestion}`;
}

function formatSummary(summary: ScanSummary): string {
  const files = `${summary.filesScanned} ${plural('file', summary.filesScanned)}`;
  if (summary.errors === 0 && summary.warnings === 0) {
    return `✓ No issues found in ${files}.`;
  }
  const problems = summary.errors + summary.warnings;
  const errors = `${summary.errors} ${plural('error', summary.errors)}`;
  const warnings = `${summary.warnings} ${plural('warning', summary.warnings)}`;
  return `✖ ${problems} ${plural('problem', problems)} (${errors}, ${warnings}) in ${files}.`;
}

function plural(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}
