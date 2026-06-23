import { RULE_DEFAULT_SEVERITY } from '../diagnostics/rule-catalog.js';
import type { ResolvedConfig } from './config-schema.js';

/**
 * Built-in configuration applied when no config file is present and as the base
 * that any user config is merged over. The sBTC mainnet principal is the
 * confirmed SIP-010 token contract.
 */
export const DEFAULT_CONFIG: ResolvedConfig = {
  version: '0.1.0',
  scan: {
    include: ['src/**/*.{ts,tsx,js,jsx}', 'app/**/*.{ts,tsx}', 'pages/**/*.{ts,tsx}'],
    exclude: ['node_modules/**', 'dist/**', 'build/**'],
  },
  rules: { ...RULE_DEFAULT_SEVERITY },
  assetContracts: {
    sbtc: {
      type: 'sip010',
      contract: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
      tokenName: 'sbtc',
      transferFunctions: ['transfer'],
    },
  },
  transferLikeFunctionNames: ['transfer', 'swap', 'deposit', 'withdraw', 'pay', 'donate'],
  overrides: [],
};
