import type { Finding } from '../diagnostics/finding.js';
import type { Location } from '../diagnostics/location.js';
import type { SuppressionDirective } from './parse-directives.js';

/**
 * A non-fatal message about a suppression directive the tool ignored — currently
 * only directives missing the mandatory reason. Surfaced separately from
 * findings so it never affects the exit code.
 */
export interface SuppressionNotice {
  message: string;
  location: Location;
}

/** The outcome of applying suppression: the surviving findings and any notices. */
export interface SuppressionResult {
  findings: Finding[];
  notices: SuppressionNotice[];
}

/**
 * Drops findings covered by a justified `disable-next-line` directive: a finding
 * is suppressed when a directive on the previous line lists its rule id and
 * carries a non-empty reason. Directives without a reason suppress nothing and
 * instead produce a notice, so unjustified silencing is surfaced rather than
 * honored.
 */
export function applySuppression(
  findings: readonly Finding[],
  directives: readonly SuppressionDirective[],
  file: string,
): SuppressionResult {
  const findingsKept = findings.filter((finding) => !isSuppressed(finding, directives));

  const notices: SuppressionNotice[] = directives
    .filter((directive) => directive.reason.length === 0)
    .map((directive) => ({
      message: `Ignored stx-tx-guard-disable-next-line for ${directive.ruleIds.join(', ')}: a reason is required (add "-- <reason>").`,
      location: { file, line: directive.line, column: 1 },
    }));

  return { findings: findingsKept, notices };
}

function isSuppressed(finding: Finding, directives: readonly SuppressionDirective[]): boolean {
  return directives.some(
    (directive) =>
      directive.reason.length > 0 &&
      directive.line + 1 === finding.location.line &&
      directive.ruleIds.includes(finding.ruleId),
  );
}
