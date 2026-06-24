import type { ResolvedConfig } from '../config/config-schema.js';
import type { Rule } from './rule.js';
import { stx001MissingPostConditions } from './stx001-missing-postconditions.js';
import { stx002EmptyPostConditions } from './stx002-empty-postconditions.js';
import { stx003AllowMode } from './stx003-allow-mode.js';
import { stx004MissingMode } from './stx004-missing-mode.js';
import { stx005FtPostCondition } from './stx005-ft-postcondition.js';
import { stx006StxNftPostCondition } from './stx006-stx-nft-postcondition.js';
import { stx007SenderKey } from './stx007-senderkey.js';

/**
 * The canonical rule set, in ascending rule-id (report) order. Rules are
 * registered here as they are implemented; the engine assembles the active set
 * from this single list.
 */
export const ALL_RULES: readonly Rule[] = [
  stx001MissingPostConditions,
  stx002EmptyPostConditions,
  stx003AllowMode,
  stx004MissingMode,
  stx005FtPostCondition,
  stx006StxNftPostCondition,
  stx007SenderKey,
];

/**
 * Selects the rules that should run for a given configuration, dropping any
 * whose configured setting is `off`.
 */
export function selectActiveRules(rules: readonly Rule[], config: ResolvedConfig): Rule[] {
  return rules.filter((rule) => config.rules[rule.id] !== 'off');
}
