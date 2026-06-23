import { describe, expect, it } from 'vitest';
import {
  RULE_CATALOG,
  RULE_DEFAULT_SEVERITY,
  RULE_IDS,
} from '../../../src/diagnostics/rule-catalog.js';

describe('RULE_CATALOG', () => {
  it('has a complete metadata entry for every rule id', () => {
    for (const id of RULE_IDS) {
      const meta = RULE_CATALOG[id];
      expect(meta.id).toBe(id);
      expect(meta.title.length).toBeGreaterThan(0);
      expect(meta.fixHint.length).toBeGreaterThan(0);
      expect(meta.docAnchor.length).toBeGreaterThan(0);
    }
  });

  it('derives default severities that match the catalog', () => {
    for (const id of RULE_IDS) {
      expect(RULE_DEFAULT_SEVERITY[id]).toBe(RULE_CATALOG[id].defaultSeverity);
    }
  });

  it('preserves the documented default severities', () => {
    expect(RULE_DEFAULT_SEVERITY).toEqual({
      STX001: 'error',
      STX002: 'error',
      STX003: 'error',
      STX004: 'warn',
      STX005: 'error',
      STX006: 'warn',
      STX007: 'error',
    });
  });
});
