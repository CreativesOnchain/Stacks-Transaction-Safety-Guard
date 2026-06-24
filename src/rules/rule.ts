import type { ParsedSource } from '../ast/parse-source.js';
import type { ResolvedConfig } from '../config/config-schema.js';
import type { Finding } from '../diagnostics/finding.js';
import type { Location } from '../diagnostics/location.js';
import type { RuleId, RuleMeta } from '../diagnostics/rule-catalog.js';
import type { TransactionCall } from '../transaction-model/model.js';

/** Shared inputs available to every rule evaluation. */
export interface RuleContext {
  config: ResolvedConfig;
  source: ParsedSource;
}

/** Context for a file-level rule, adding every call extracted from the file. */
export interface FileRuleContext extends RuleContext {
  calls: readonly TransactionCall[];
}

/**
 * A single safety rule. A rule implements exactly one evaluation hook:
 * per-call rules (STX001–STX006) implement `evaluate` and receive one
 * transaction call at a time; the file-level rule (STX007, which flags
 * `senderKey` anywhere in a file) implements `evaluateFile` and runs once per
 * file. Rules report their natural severity; the engine resolves the effective
 * severity from config and `--strict`.
 */
export interface Rule {
  id: RuleId;
  evaluate?(call: TransactionCall, ctx: RuleContext): Finding[];
  evaluateFile?(ctx: FileRuleContext): Finding[];
}

/**
 * Builds a finding from a rule's catalog metadata, so each rule supplies only
 * the situation-specific message and location and inherits its id, natural
 * severity, and fix hint from the single {@link RULE_CATALOG}. The engine later
 * re-stamps severity from config and `--strict`; the value here is the rule's
 * natural severity.
 */
export function ruleFinding(meta: RuleMeta, message: string, location: Location): Finding {
  return {
    ruleId: meta.id,
    severity: meta.defaultSeverity,
    message,
    location,
    suggestion: meta.fixHint,
  };
}
