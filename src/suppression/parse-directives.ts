import type { ParsedSource } from '../ast/parse-source.js';
import { RULE_IDS, type RuleId } from '../diagnostics/rule-catalog.js';

/**
 * An inline suppression directive parsed from a `// stx-tx-guard-disable-next-line`
 * comment. It targets findings on the line immediately after `line` for the
 * listed `ruleIds`; suppression only takes effect when `reason` is non-empty.
 */
export interface SuppressionDirective {
  ruleIds: RuleId[];
  /** 1-based line the directive comment appears on; it targets `line + 1`. */
  line: number;
  /** Justification after `--`, trimmed; empty when none was supplied. */
  reason: string;
}

const DIRECTIVE = /\/\/\s*stx-tx-guard-disable-next-line\b(.*)/;
const KNOWN_RULES = new Set<string>(RULE_IDS);

/**
 * Scans a source for `// stx-tx-guard-disable-next-line <RULE>[, <RULE>] -- <reason>`
 * comments. Rule ids are validated against the catalog (unknown ids are dropped),
 * and the reason is everything after the first `--`. A directive may be a
 * standalone or trailing comment; only `//` line comments are recognized.
 */
export function parseDirectives(source: ParsedSource): SuppressionDirective[] {
  const directives: SuppressionDirective[] = [];
  source.text.split('\n').forEach((text, index) => {
    const match = DIRECTIVE.exec(text);
    if (!match) return;

    const body = match[1] ?? '';
    const separator = body.indexOf('--');
    const rulePart = separator === -1 ? body : body.slice(0, separator);
    const reason = separator === -1 ? '' : body.slice(separator + 2).trim();

    const matched: string[] = rulePart.match(/STX\d{3}/g) ?? [];
    const ruleIds = matched.filter((id): id is RuleId => KNOWN_RULES.has(id));
    if (ruleIds.length === 0) return;

    directives.push({ ruleIds, line: index + 1, reason });
  });
  return directives;
}
