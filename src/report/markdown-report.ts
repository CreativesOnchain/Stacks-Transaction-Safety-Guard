import type { Finding } from '../diagnostics/finding.js';
import { displayPath, type ScanResult, type ScanSummary } from './report-model.js';

/**
 * Renders a scan result as Markdown for PR comments and CI logs: a heading, a
 * summary line, and (when there are findings) a table with one row per finding —
 * file path, line, rule id, severity, issue summary, and suggested fix. File
 * paths are shown relative to `cwd`.
 */
export function formatMarkdownReport(result: ScanResult, cwd: string = process.cwd()): string {
  const parts = ['# stx-tx-guard report', '', summaryLine(result.summary)];
  if (result.findings.length > 0) {
    parts.push(
      '',
      '| File | Line | Rule | Severity | Issue | Fix |',
      '| --- | --- | --- | --- | --- | --- |',
      ...result.findings.map((finding) => row(finding, cwd)),
    );
  }
  return parts.join('\n');
}

function summaryLine(summary: ScanSummary): string {
  const files = count(summary.filesScanned, 'file');
  if (summary.errors === 0 && summary.warnings === 0) {
    return `✓ No issues found in ${files}.`;
  }
  const problems = count(summary.errors + summary.warnings, 'problem');
  return `✖ **${problems}** (${count(summary.errors, 'error')}, ${count(summary.warnings, 'warning')}) in ${files}.`;
}

function row(finding: Finding, cwd: string): string {
  const cells = [
    `\`${displayPath(finding.location.file, cwd)}\``,
    String(finding.location.line),
    finding.ruleId,
    finding.severity,
    escapeCell(finding.message),
    escapeCell(finding.suggestion),
  ];
  return `| ${cells.join(' | ')} |`;
}

/** Escapes Markdown table cell content so a literal `|` does not break the column layout. */
function escapeCell(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
}

function count(n: number, word: string): string {
  return `${n} ${n === 1 ? word : `${word}s`}`;
}
