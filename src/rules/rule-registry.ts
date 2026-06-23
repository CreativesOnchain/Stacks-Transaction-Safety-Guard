import type { ResolvedConfig } from '../config/config-schema.js';
import type { Rule } from './rule.js';

/**
 * The canonical rule set, in report order. Rules are registered here as they
 * are implemented (STX001–STX007); it is intentionally empty until those land,
 * so the engine has a single place to assemble from.
 */
export const ALL_RULES: readonly Rule[] = [];

/**
 * Selects the rules that should run for a given configuration, dropping any
 * whose configured setting is `off`.
 */
export function selectActiveRules(rules: readonly Rule[], config: ResolvedConfig): Rule[] {
  return rules.filter((rule) => config.rules[rule.id] !== 'off');
}
