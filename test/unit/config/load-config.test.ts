import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ConfigError,
  DEFAULT_CONFIG_FILENAME,
  loadConfig,
} from '../../../src/config/load-config.js';
import { DEFAULT_CONFIG } from '../../../src/config/default-config.js';

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'stx-tx-guard-'));
  tempDirs.push(dir);
  return dir;
}

function writeConfig(dir: string, contents: unknown): void {
  const file = join(dir, DEFAULT_CONFIG_FILENAME);
  const text = typeof contents === 'string' ? contents : JSON.stringify(contents);
  writeFileSync(file, text, 'utf8');
}

afterAll(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('loadConfig', () => {
  it('returns defaults when no config file is present', () => {
    expect(loadConfig({ cwd: makeTempDir() })).toEqual(DEFAULT_CONFIG);
  });

  it('loads and validates a full valid config', () => {
    const dir = makeTempDir();
    writeConfig(dir, DEFAULT_CONFIG);
    expect(loadConfig({ cwd: dir })).toEqual(DEFAULT_CONFIG);
  });

  it('merges a partial config over defaults: arrays replace, objects merge per key', () => {
    const dir = makeTempDir();
    writeConfig(dir, {
      rules: { STX004: 'error' },
      transferLikeFunctionNames: ['transfer', 'stake'],
    });

    const config = loadConfig({ cwd: dir });

    expect(config.rules.STX004).toBe('error');
    expect(config.rules.STX001).toBe('error');
    expect(config.rules.STX006).toBe('warn');
    expect(config.transferLikeFunctionNames).toEqual(['transfer', 'stake']);
    expect(config.assetContracts.sbtc?.contract).toBe(
      DEFAULT_CONFIG.assetContracts.sbtc?.contract,
    );
  });

  it('throws a ConfigError naming the offending path for an invalid severity', () => {
    const dir = makeTempDir();
    writeConfig(dir, { rules: { STX001: 'fatal' } });

    expect(() => loadConfig({ cwd: dir })).toThrow(ConfigError);
    expect(() => loadConfig({ cwd: dir })).toThrow(/rules\.STX001/);
  });

  it('throws a ConfigError when a glob list has the wrong type', () => {
    const dir = makeTempDir();
    writeConfig(dir, { scan: { include: 'src/**' } });
    expect(() => loadConfig({ cwd: dir })).toThrow(ConfigError);
  });

  it('throws a ConfigError for malformed JSON', () => {
    const dir = makeTempDir();
    writeConfig(dir, '{ not valid json');
    expect(() => loadConfig({ cwd: dir })).toThrow(/not valid JSON/);
  });

  it('throws a ConfigError when an explicit config path is missing', () => {
    expect(() => loadConfig({ configPath: '/no/such/stx-tx-guard.config.json' })).toThrow(
      ConfigError,
    );
  });
});
