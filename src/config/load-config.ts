import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { z } from 'zod';
import { DEFAULT_CONFIG } from './default-config.js';
import {
  resolvedConfigSchema,
  userConfigSchema,
  type ResolvedConfig,
  type UserConfig,
} from './config-schema.js';

export const DEFAULT_CONFIG_FILENAME = 'stx-tx-guard.config.json';

/**
 * Raised for any recoverable configuration problem (missing file, invalid JSON,
 * schema violation) so the CLI can present a single, friendly message.
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export interface LoadConfigOptions {
  /** Explicit config file path; relative paths resolve against `cwd`. */
  configPath?: string;
  /** Directory used to resolve a relative or default config path. */
  cwd?: string;
}

/**
 * Resolves the effective configuration: an explicit or conventionally-named
 * file is read, validated, and merged over the defaults; when no file is found
 * (and none was explicitly requested) the defaults are returned unchanged.
 */
export function loadConfig(options: LoadConfigOptions = {}): ResolvedConfig {
  const cwd = options.cwd ?? process.cwd();
  const isExplicit = options.configPath !== undefined;
  const filePath = resolveConfigPath(cwd, options.configPath);

  if (!existsSync(filePath)) {
    if (isExplicit) {
      throw new ConfigError(`Configuration file not found: ${filePath}`);
    }
    return structuredClone(DEFAULT_CONFIG);
  }

  const userConfig = parseUserConfig(filePath, readConfigText(filePath));
  return resolvedConfigSchema.parse(mergeConfig(DEFAULT_CONFIG, userConfig));
}

function resolveConfigPath(cwd: string, configPath?: string): string {
  if (configPath === undefined) {
    return join(cwd, DEFAULT_CONFIG_FILENAME);
  }
  return isAbsolute(configPath) ? configPath : resolve(cwd, configPath);
}

function readConfigText(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new ConfigError(`Could not read configuration file ${filePath}: ${messageOf(error)}`);
  }
}

function parseUserConfig(filePath: string, text: string): UserConfig {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (error) {
    throw new ConfigError(`Configuration file ${filePath} is not valid JSON: ${messageOf(error)}`);
  }

  const result = userConfigSchema.safeParse(json);
  if (!result.success) {
    throw new ConfigError(formatIssues(filePath, result.error));
  }
  return result.data;
}

/**
 * Merges a validated user config over the defaults. Arrays replace their
 * default (the user owns the full list); keyed objects merge per key so the
 * defaults remain available unless explicitly overridden.
 */
function mergeConfig(defaults: ResolvedConfig, user: UserConfig): ResolvedConfig {
  return {
    version: user.version ?? defaults.version,
    scan: {
      include: user.scan?.include ?? defaults.scan.include,
      exclude: user.scan?.exclude ?? defaults.scan.exclude,
    },
    rules: { ...defaults.rules, ...user.rules },
    assetContracts: { ...defaults.assetContracts, ...user.assetContracts },
    transferLikeFunctionNames:
      user.transferLikeFunctionNames ?? defaults.transferLikeFunctionNames,
    overrides: user.overrides ?? defaults.overrides,
  };
}

function formatIssues(filePath: string, error: z.ZodError): string {
  const lines = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.map(String).join('.') : '(root)';
    return `  - ${path}: ${issue.message}`;
  });
  return `Invalid configuration in ${filePath}:\n${lines.join('\n')}`;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
