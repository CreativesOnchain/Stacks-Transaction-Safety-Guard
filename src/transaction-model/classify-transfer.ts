import type { AssetType, ResolvedConfig } from '../config/config-schema.js';
import type { TransactionCall } from './model.js';

/**
 * Whether a call moves assets, and — when its contract matches a configured
 * asset — which asset classes it touches.
 */
export interface TransferClassification {
  transferLike: boolean;
  /** Asset classes derived from matching `assetContracts` entries (deduplicated). */
  assetClasses: AssetType[];
  /** Key of the first matching `assetContracts` entry, when any. */
  matchedContract?: string;
}

/**
 * Classifies a call as transfer-like when its resolved `functionName` is one of
 * the configured transfer-like names, or its contract identifier matches a
 * configured asset contract. Asset classes come solely from contract matches:
 * a function-name match alone makes a call transfer-like (so the mode and
 * presence-of-post-conditions rules apply) without asserting any specific asset
 * class. An unresolved `functionName` and an unmatched contract yield no
 * classification, so dynamic calls are skipped rather than guessed.
 */
export function classifyTransfer(
  call: TransactionCall,
  config: ResolvedConfig,
): TransferClassification {
  const functionNameMatches =
    call.functionName !== undefined &&
    config.transferLikeFunctionNames.includes(call.functionName);

  const assetClasses: AssetType[] = [];
  let matchedContract: string | undefined;

  if (call.contractId !== undefined) {
    for (const [key, contract] of Object.entries(config.assetContracts)) {
      if (contract.contract === call.contractId) {
        if (!assetClasses.includes(contract.type)) assetClasses.push(contract.type);
        matchedContract ??= key;
      }
    }
  }

  const transferLike = functionNameMatches || assetClasses.length > 0;
  return {
    transferLike,
    assetClasses,
    ...(matchedContract !== undefined && { matchedContract }),
  };
}
