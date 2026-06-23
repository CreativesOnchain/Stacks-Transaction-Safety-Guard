import { z } from 'zod';
import { RULE_IDS, type RuleId } from '../diagnostics/rule-catalog.js';

/**
 * Per-rule configuration value. `'off'` disables the rule entirely; `'error'`
 * and `'warn'` set its effective severity.
 */
export const ruleSettingSchema = z.enum(['error', 'warn', 'off']);
export type RuleSetting = z.infer<typeof ruleSettingSchema>;

export const assetTypeSchema = z.enum(['sip010', 'stx', 'nft']);
export type AssetType = z.infer<typeof assetTypeSchema>;

export const assetContractSchema = z.object({
  type: assetTypeSchema,
  contract: z.string().min(1),
  tokenName: z.string().min(1).optional(),
  transferFunctions: z.array(z.string().min(1)).default([]),
});
export type AssetContract = z.infer<typeof assetContractSchema>;

export const scanConfigSchema = z.object({
  include: z.array(z.string().min(1)),
  exclude: z.array(z.string().min(1)),
});
export type ScanConfig = z.infer<typeof scanConfigSchema>;

const ruleSettingsShape = Object.fromEntries(
  RULE_IDS.map((id) => [id, ruleSettingSchema] as const),
) as Record<RuleId, typeof ruleSettingSchema>;

export const rulesSchema = z.object(ruleSettingsShape);
export type RulesConfig = z.infer<typeof rulesSchema>;

/**
 * The fully-populated configuration consumed by the rest of the pipeline. Every
 * rule and required field is present after defaults are merged in.
 */
export const resolvedConfigSchema = z.object({
  version: z.string(),
  scan: scanConfigSchema,
  rules: rulesSchema,
  assetContracts: z.record(z.string(), assetContractSchema),
  transferLikeFunctionNames: z.array(z.string().min(1)),
  // Reserved for a future config-based suppression mechanism; not enforced.
  overrides: z.array(z.unknown()).default([]),
});
export type ResolvedConfig = z.infer<typeof resolvedConfigSchema>;

/**
 * The shape accepted from a user config file. Every field is optional so a
 * partial file validates and is merged over the defaults.
 */
export const userConfigSchema = z.object({
  version: z.string().optional(),
  scan: scanConfigSchema.partial().optional(),
  rules: rulesSchema.partial().optional(),
  assetContracts: z.record(z.string(), assetContractSchema).optional(),
  transferLikeFunctionNames: z.array(z.string().min(1)).optional(),
  overrides: z.array(z.unknown()).optional(),
});
export type UserConfig = z.infer<typeof userConfigSchema>;
