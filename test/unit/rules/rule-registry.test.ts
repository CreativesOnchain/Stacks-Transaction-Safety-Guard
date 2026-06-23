import { describe, expect, it } from 'vitest';
import { ALL_RULES, selectActiveRules } from '../../../src/rules/rule-registry.js';
import type { Rule } from '../../../src/rules/rule.js';
import { DEFAULT_CONFIG } from '../../../src/config/default-config.js';

const callRule: Rule = { id: 'STX001', evaluate: () => [] };
const fileRule: Rule = { id: 'STX007', evaluateFile: () => [] };

describe('selectActiveRules', () => {
  it('keeps rules whose setting is not off', () => {
    expect(selectActiveRules([callRule, fileRule], DEFAULT_CONFIG)).toEqual([callRule, fileRule]);
  });

  it('drops rules turned off in config', () => {
    const config = {
      ...DEFAULT_CONFIG,
      rules: { ...DEFAULT_CONFIG.rules, STX001: 'off' as const },
    };
    expect(selectActiveRules([callRule, fileRule], config)).toEqual([fileRule]);
  });
});

describe('ALL_RULES', () => {
  it('is empty until the individual rules are implemented', () => {
    expect(ALL_RULES).toEqual([]);
  });
});
