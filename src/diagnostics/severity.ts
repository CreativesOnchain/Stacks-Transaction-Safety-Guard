/**
 * Severity of an emitted finding. `'off'` is not a severity; it is a rule
 * configuration value handled by the config layer to disable a rule.
 */
export type Severity = 'error' | 'warn';

export const SEVERITIES: readonly Severity[] = ['error', 'warn'];
