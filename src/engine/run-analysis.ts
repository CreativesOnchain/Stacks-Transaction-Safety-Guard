import type { ParsedSource } from '../ast/parse-source.js';
import type { ResolvedConfig } from '../config/config-schema.js';
import type { Finding } from '../diagnostics/finding.js';
import type { FileRuleContext, Rule, RuleContext } from '../rules/rule.js';
import { ALL_RULES, selectActiveRules } from '../rules/rule-registry.js';
import { findTransactionCalls } from '../transaction-model/find-calls.js';
import { resolveSeverity } from './resolve-severity.js';

export interface AnalyzeOptions {
  source: ParsedSource;
  config: ResolvedConfig;
  strict: boolean;
  /** Rule set to run; defaults to the canonical {@link ALL_RULES}. Injectable for tests. */
  rules?: readonly Rule[];
}

/**
 * Runs the analysis pipeline for one parsed source: extract the transaction
 * model, evaluate the active rules (per-call then file-level), and stamp every
 * finding with its effective severity, dropping any whose rule resolves to
 * `off`. Rule implementations are injected so this wiring can be exercised
 * before the individual rules exist; the canonical set is empty until they land.
 */
export function analyzeSource(options: AnalyzeOptions): Finding[] {
  const { source, config, strict } = options;
  const activeRules = selectActiveRules(options.rules ?? ALL_RULES, config);
  const calls = findTransactionCalls(source);

  const ruleContext: RuleContext = { config, source };
  const fileContext: FileRuleContext = { config, source, calls };

  const raw: Finding[] = [];
  for (const rule of activeRules) {
    if (rule.evaluate) {
      for (const call of calls) raw.push(...rule.evaluate(call, ruleContext));
    }
    if (rule.evaluateFile) {
      raw.push(...rule.evaluateFile(fileContext));
    }
  }

  const findings: Finding[] = [];
  for (const finding of raw) {
    const severity = resolveSeverity(config.rules[finding.ruleId], strict);
    if (severity === 'off') continue;
    findings.push({ ...finding, severity });
  }
  return findings;
}
