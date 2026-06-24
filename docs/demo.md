# Demo — catching an unsafe sBTC transfer before it ships

This walkthrough is reproducible end to end; a GIF or screen recording can be captured
directly from these steps. It proves the full story: a local scan flags an unsafe
flow, the safe version passes, and a non-transfer call is not flagged.

## Setup

```bash
npm install
npm run build
```

## 1. Unsafe sBTC flow fails

`examples/unsafe-sbtc-transfer` has two flawed helpers: one whose post-conditions
constrain STX but not the sBTC token it moves, and one with no post-conditions at all —
both signing with a raw `senderKey`.

```bash
npm run scan:unsafe
```

```text
examples/unsafe-sbtc-transfer/src/index.ts:27:10  ERROR  STX001  This asset-moving call declares no post-conditions, so it can transfer assets without limit.
    fix: Add postConditions covering each asset this call transfers, and set postConditionMode to Deny.
examples/unsafe-sbtc-transfer/src/index.ts:27:10  WARN  STX004  postConditionMode is not set on this asset-moving call.
    fix: Set postConditionMode explicitly to Deny rather than relying on the default.
examples/unsafe-sbtc-transfer/src/index.ts:10:10  ERROR  STX005  This call moves a SIP-010 token but its post-conditions include no fungible-token condition.
    fix: Add a Pc(...).ft(...) post-condition for the token this call moves.
examples/unsafe-sbtc-transfer/src/index.ts:17:5  ERROR  STX007  A senderKey (a raw private key) is used in transaction-building code.
    fix: Sign with a wallet or Stacks Connect instead of embedding a senderKey in application code.
examples/unsafe-sbtc-transfer/src/index.ts:32:5  ERROR  STX007  A senderKey (a raw private key) is used in transaction-building code.
    fix: Sign with a wallet or Stacks Connect instead of embedding a senderKey in application code.

✖ 5 problems (4 errors, 1 warning) in 1 file.
```

Exit code `1`. The scan flags missing post-conditions (STX001), an unspecified mode
(STX004), a missing sBTC fungible-token post-condition (STX005), and the exposed
signing key (STX007).

## 2. Safe sBTC flow passes

`examples/safe-sbtc-transfer` signs through the user's wallet via Stacks Connect (no
`senderKey`), constrains the exact sBTC amount with `Pc(...).ft(...)`, and uses deny
mode.

```bash
npm run scan:safe
```

```text
✓ No issues found in 1 file.
```

Exit code `0`.

## 3. A non-transfer call is not flagged

`examples/no-transfer-contract-call` makes a read-only call that moves no assets,
proving the scanner does not blindly fail every contract call.

```bash
npm run scan:no-transfer
```

```text
✓ No issues found in 1 file.
```

Exit code `0`.

## 4. CI behaviour

In strict mode, warnings also fail. The example
[GitHub Action](../.github/workflows/tx-guard.yml) gates on the safe and no-transfer
demos passing and demonstrates the unsafe demo failing:

```bash
node dist/cli/bin.js scan examples/unsafe-sbtc-transfer --strict --report markdown   # exit 1
node dist/cli/bin.js scan examples/safe-sbtc-transfer   --strict --report markdown   # exit 0
```

See the [CI guide](ci.md) and the [success metrics](success-metrics.md) for how this
maps to the project's targets.
