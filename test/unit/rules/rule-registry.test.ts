import { describe, expect, it } from 'vitest';
import { ALL_RULES, selectActiveRules } from '../../../src/rules/rule-registry.js';
import type { Rule } from '../../../src/rules/rule.js';
import { DEFAULT_CONFIG } from '../../../src/config/default-config.js';
import { RULE_IDS } from '../../../src/diagnostics/rule-catalog.js';

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
  const ids = ALL_RULES.map((rule) => rule.id);

  it('registers only known rule ids, without duplicates', () => {
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => RULE_IDS.includes(id))).toBe(true);
  });

  it('is ordered by ascending rule id (report order)', () => {
    expect(ids).toEqual([...ids].sort());
  });

  it('gives every rule exactly one evaluation hook', () => {
    for (const rule of ALL_RULES) {
      expect(Boolean(rule.evaluate) !== Boolean(rule.evaluateFile)).toBe(true);
    }
  });
});
