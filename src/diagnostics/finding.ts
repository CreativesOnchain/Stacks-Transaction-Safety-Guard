import type { Location } from './location.js';
import type { RuleId } from './rule-catalog.js';
import type { Severity } from './severity.js';

/**
 * A single result emitted by a rule. `severity` is the effective severity after
 * config and `--strict` resolution; `suggestion` is the one-line remediation
 * shown to the user.
 */
export interface Finding {
  ruleId: RuleId;
  severity: Severity;
  message: string;
  location: Location;
  suggestion: string;
}
