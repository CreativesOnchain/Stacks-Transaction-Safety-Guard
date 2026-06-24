# Configuration

`stx-tx-guard` runs with sensible defaults and needs no configuration to start. To
customize it, add a `stx-tx-guard.config.json` file.

## How the config is resolved

1. If `--config <file>` is passed, that file is loaded (an error is raised if it is
   missing).
2. Otherwise `stx-tx-guard.config.json` in the working directory is used if present.
3. Otherwise the built-in defaults apply.

A user config is **merged over the defaults**: arrays (`scan.include`,
`scan.exclude`, `transferLikeFunctionNames`) replace the default list, while keyed
objects (`rules`, `assetContracts`) merge per key, so you only specify what you
change. Every field is optional.

## Schema

| Field | Type | Meaning |
| --- | --- | --- |
| `version` | string | Config version marker. |
| `scan.include` | string[] | Globs (relative to the scan root) of files to scan. |
| `scan.exclude` | string[] | Globs to skip. |
| `rules` | object | Per-rule setting: `"error"`, `"warn"`, or `"off"`. |
| `assetContracts` | object | Map of asset key → contract definition (below). |
| `transferLikeFunctionNames` | string[] | Function names that make a call transfer-like. |
| `overrides` | array | **Reserved** for a future config-based suppression mechanism; not enforced. Use [inline suppression](rules.md#suppressing-a-finding) instead. |

Each `assetContracts` entry:

| Field | Type | Meaning |
| --- | --- | --- |
| `type` | `"sip010"` \| `"stx"` \| `"nft"` | Asset class. `sip010` drives STX005; `stx`/`nft` drive STX006. |
| `contract` | string | Combined `"address.name"` contract identifier. |
| `tokenName` | string (optional) | Human label for the token. |
| `transferFunctions` | string[] | Function names specific to this contract (defaults to `[]`). |

A call is treated as moving an asset class when its target contract matches one of
these entries; STX005/STX006 then check for the matching post-condition.

## Default configuration

```json
{
  "version": "0.1.0",
  "scan": {
    "include": ["src/**/*.{ts,tsx,js,jsx}", "app/**/*.{ts,tsx}", "pages/**/*.{ts,tsx}"],
    "exclude": ["node_modules/**", "dist/**", "build/**"]
  },
  "rules": {
    "STX001": "error", "STX002": "error", "STX003": "error",
    "STX004": "warn",  "STX005": "error", "STX006": "warn", "STX007": "error"
  },
  "assetContracts": {
    "sbtc": {
      "type": "sip010",
      "contract": "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token",
      "tokenName": "sbtc",
      "transferFunctions": ["transfer"]
    }
  },
  "transferLikeFunctionNames": ["transfer", "swap", "deposit", "withdraw", "pay", "donate"],
  "overrides": []
}
```

The sBTC mainnet principal `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token` is
the canonical SIP-010 token contract.

## Worked examples

**Register your own SIP-010 token** (adds to the default `sbtc` entry):

```json
{
  "assetContracts": {
    "my-token": {
      "type": "sip010",
      "contract": "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
      "tokenName": "MYT",
      "transferFunctions": ["transfer"]
    }
  }
}
```

**Track an STX pool and an NFT collection, and raise STX006 to error:**

```json
{
  "rules": { "STX006": "error" },
  "assetContracts": {
    "pool": { "type": "stx", "contract": "SP….pool", "transferFunctions": [] },
    "art":  { "type": "nft", "contract": "SP….art",  "transferFunctions": [] }
  }
}
```

**Turn a rule off** (for example, if your app intentionally signs server-side):

```json
{ "rules": { "STX007": "off" } }
```

**Add project-specific transfer-like function names:**

```json
{ "transferLikeFunctionNames": ["transfer", "swap", "stake", "unstake", "claim"] }
```

> Note: `transferLikeFunctionNames` replaces the default list, so include the defaults
> you still want.

See the [rule reference](rules.md) for what each rule checks and the
[CI guide](ci.md) for using config in continuous integration.
