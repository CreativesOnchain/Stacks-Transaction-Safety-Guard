import ts from 'typescript';
import type { OptionsObject, PostConditionMode } from './model.js';
import { getPropertyValue, hasProperty } from './resolve-options.js';

/**
 * Reduces the `postConditionMode` property to `allow`, `deny`, or `missing`.
 *
 * Only `allow` (which disables post-condition enforcement) and `missing` (the
 * property is absent) are actionable. Every other recognized form — `deny`,
 * `originator`, the numeric enum values, and any present-but-dynamic value — is
 * reported as `deny` so neither the permissive-mode nor the missing-mode rule
 * fires on a call that did set a non-permissive mode.
 */
export function readMode(options: OptionsObject): PostConditionMode {
  // Unresolved options are skipped upstream; report the safe state defensively.
  if (!options.resolved) return 'deny';
  const object = options.node;

  if (!hasProperty(object, 'postConditionMode')) return 'missing';

  const value = getPropertyValue(object, 'postConditionMode');
  if (!value) return 'deny';

  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
    return value.text.toLowerCase() === 'allow' ? 'allow' : 'deny';
  }
  if (ts.isPropertyAccessExpression(value)) {
    return value.name.text === 'Allow' ? 'allow' : 'deny';
  }
  if (ts.isNumericLiteral(value)) {
    // PostConditionMode enum: Allow = 1, Deny = 2, Originator = 3.
    return value.text === '1' ? 'allow' : 'deny';
  }
  return 'deny';
}
