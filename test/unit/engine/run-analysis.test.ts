import { describe, expect, it } from 'vitest';
import { analyzeSource } from '../../../src/engine/run-analysis.js';
import { parseSnippet } from '../../support/parse-snippet.js';
import { DEFAULT_CONFIG } from '../../../src/config/default-config.js';
import type { ResolvedConfig } from '../../../src/config/config-schema.js';
import type { Finding } from '../../../src/diagnostics/finding.js';
import type { Rule } from '../../../src/rules/rule.js';

const location = { file: 'snippet.ts', line: 1, column: 1 };

function finding(over: Partial<Finding>): Finding {
  return { ruleId: 'STX001', severity: 'error', message: 'm', location, suggestion: 'fix', ...over };
}

/** Flags every transaction call it is given. */
const callRule: Rule = { id: 'STX001', evaluate: (call) => [finding({ location: call.location })] };

/** Emits once per file, independent of call count. */
const fileRule: Rule = {
  id: 'STX007',
  evaluateFile: () => [finding({ ruleId: 'STX007' })],
};

const ONE_CALL = `makeContractCall({ functionName: 'transfer' });`;

describe('analyzeSource', () => {
  it('runs a per-call rule over every extracted call', () => {
    const findings = analyzeSource({
      source: parseSnippet(ONE_CALL),
      config: DEFAULT_CONFIG,
      strict: false,
      rules: [callRule],
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ ruleId: 'STX001', severity: 'error' });
  });

  it('runs a file-level rule once regardless of call count', () => {
    const findings = analyzeSource({
      source: parseSnippet(`${ONE_CALL}\nmakeContractCall({ functionName: 'swap' });`),
      config: DEFAULT_CONFIG,
      strict: false,
      rules: [fileRule],
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]?.ruleId).toBe('STX007');
  });

  it('produces no findings with the empty canonical rule set', () => {
    const findings = analyzeSource({
      source: parseSnippet(ONE_CALL),
      config: DEFAULT_CONFIG,
      strict: false,
    });
    expect(findings).toEqual([]);
  });

  it('excludes rules turned off in config', () => {
    const config: ResolvedConfig = {
      ...DEFAULT_CONFIG,
      rules: { ...DEFAULT_CONFIG.rules, STX001: 'off' },
    };
    const findings = analyzeSource({
      source: parseSnippet(ONE_CALL),
      config,
      strict: false,
      rules: [callRule],
    });
    expect(findings).toEqual([]);
  });

  it('stamps effective severity from config, not from the rule', () => {
    // STX004 defaults to warn; the rule reports error but the engine is authoritative.
    const warnRule: Rule = { id: 'STX004', evaluate: () => [finding({ ruleId: 'STX004', severity: 'error' })] };
    const findings = analyzeSource({
      source: parseSnippet(ONE_CALL),
      config: DEFAULT_CONFIG,
      strict: false,
      rules: [warnRule],
    });
    expect(findings[0]?.severity).toBe('warn');
  });

  it('escalates warnings to errors under strict (Model A)', () => {
    const warnRule: Rule = { id: 'STX004', evaluate: () => [finding({ ruleId: 'STX004', severity: 'warn' })] };
    const findings = analyzeSource({
      source: parseSnippet(ONE_CALL),
      config: DEFAULT_CONFIG,
      strict: true,
      rules: [warnRule],
    });
    expect(findings[0]?.severity).toBe('error');
  });
});
