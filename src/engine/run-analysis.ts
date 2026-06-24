import { parseSource, type ParsedSource } from '../ast/parse-source.js';
import type { ResolvedConfig } from '../config/config-schema.js';
import type { Finding } from '../diagnostics/finding.js';
import type { FileRuleContext, Rule, RuleContext } from '../rules/rule.js';
import { ALL_RULES, selectActiveRules } from '../rules/rule-registry.js';
import { readSource, type SourceText } from '../sources/read-source.js';
import { applySuppression, type SuppressionNotice } from '../suppression/apply-suppression.js';
import { parseDirectives } from '../suppression/parse-directives.js';
import { findTransactionCalls } from '../transaction-model/find-calls.js';
import { resolveSeverity } from './resolve-severity.js';

export interface AnalyzeOptions {
  source: ParsedSource;
  config: ResolvedConfig;
  strict: boolean;
  /** Rule set to run; defaults to the canonical {@link ALL_RULES}. Injectable for tests. */
  rules?: readonly Rule[];
}

/** The result of analyzing one or more sources: findings plus suppression notices. */
export interface AnalysisResult {
  findings: Finding[];
  notices: SuppressionNotice[];
}

/**
 * Runs the analysis pipeline for one parsed source: extract the transaction
 * model, evaluate the active rules (per-call then file-level), apply inline
 * suppression to the raw findings, then stamp each survivor with its effective
 * severity (dropping any rule that resolves to `off`). Suppression runs before
 * severity resolution so a justified directive removes a finding regardless of
 * its severity, and the directives a run ignored are returned as notices.
 */
export function analyzeSource(options: AnalyzeOptions): AnalysisResult {
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

  const suppressed = applySuppression(raw, parseDirectives(source), source.path);

  const findings: Finding[] = [];
  for (const finding of suppressed.findings) {
    const severity = resolveSeverity(config.rules[finding.ruleId], strict);
    if (severity === 'off') continue;
    findings.push({ ...finding, severity });
  }
  return { findings, notices: suppressed.notices };
}

export interface AnalyzeFilesOptions {
  files: readonly string[];
  config: ResolvedConfig;
  strict: boolean;
  /** Rule set to run; defaults to the canonical {@link ALL_RULES}. */
  rules?: readonly Rule[];
  /** File reader, injectable for tests; defaults to the production {@link readSource}. */
  read?: (path: string) => SourceText;
}

/**
 * Runs the analysis over a set of files: each is read, parsed, and analyzed, and
 * the findings and notices are concatenated in file order. This is the
 * engine-level entry the CLI orchestrates; it keeps the read → parse → analyze
 * loop inside the engine so the CLI stays a thin orchestrator.
 */
export function analyzeFiles(options: AnalyzeFilesOptions): AnalysisResult {
  const read = options.read ?? readSource;
  const findings: Finding[] = [];
  const notices: SuppressionNotice[] = [];
  for (const file of options.files) {
    const source = parseSource(read(file));
    const result = analyzeSource({
      source,
      config: options.config,
      strict: options.strict,
      ...(options.rules !== undefined && { rules: options.rules }),
    });
    findings.push(...result.findings);
    notices.push(...result.notices);
  }
  return { findings, notices };
}
