import { describe, expect, it } from 'vitest';
import { resolvedConfigSchema } from '../../../src/config/config-schema.js';
import { DEFAULT_CONFIG } from '../../../src/config/default-config.js';

describe('resolvedConfigSchema', () => {
  it('accepts the shipped default config', () => {
    expect(() => resolvedConfigSchema.parse(DEFAULT_CONFIG)).not.toThrow();
  });

  it('rejects an unknown rule severity', () => {
    const invalid = { ...DEFAULT_CONFIG, rules: { ...DEFAULT_CONFIG.rules, STX001: 'fatal' } };
    expect(resolvedConfigSchema.safeParse(invalid).success).toBe(false);
  });
});
