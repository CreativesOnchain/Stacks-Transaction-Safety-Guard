import type { RuleSetting } from '../config/config-schema.js';
import type { Severity } from '../diagnostics/severity.js';

/** A rule's resolved severity, or `off` when the rule is disabled. */
export type EffectiveSeverity = Severity | 'off';

/**
 * Resolves a rule's effective severity from its configured setting and the
 * `--strict` flag (Model A): `off` stays disabled, and under strict every
 * `warn` escalates to `error` so warnings also fail the run.
 */
export function resolveSeverity(setting: RuleSetting, strict: boolean): EffectiveSeverity {
  if (setting === 'off') return 'off';
  if (strict) return 'error';
  return setting;
}
