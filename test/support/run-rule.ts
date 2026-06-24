import type { ResolvedConfig } from '../../src/config/config-schema.js';
import { DEFAULT_CONFIG } from '../../src/config/default-config.js';
import type { Finding } from '../../src/diagnostics/finding.js';
import type { FileRuleContext, Rule, RuleContext } from '../../src/rules/rule.js';
import { findTransactionCalls } from '../../src/transaction-model/find-calls.js';
import { parseSnippet } from './parse-snippet.js';

/**
 * Runs a per-call rule over every transaction call parsed from a snippet and
 * returns the rule's natural findings (before the engine re-stamps severity).
 * Lets rule unit tests assert on whether and what a rule fires without standing
 * up the full pipeline.
 */
export function runCallRule(
  rule: Rule,
  code: string,
  config: ResolvedConfig = DEFAULT_CONFIG,
): Finding[] {
  const source = parseSnippet(code);
  const ctx: RuleContext = { config, source };
  return findTransactionCalls(source).flatMap((call) => rule.evaluate?.(call, ctx) ?? []);
}

/**
 * Runs a file-level rule once over a snippet and returns its natural findings.
 * The companion to {@link runCallRule} for rules that implement `evaluateFile`.
 */
export function runFileRule(
  rule: Rule,
  code: string,
  config: ResolvedConfig = DEFAULT_CONFIG,
): Finding[] {
  const source = parseSnippet(code);
  const ctx: FileRuleContext = { config, source, calls: findTransactionCalls(source) };
  return rule.evaluateFile?.(ctx) ?? [];
}
