# Rule reference

`stx-tx-guard` ships seven rules, STX001–STX007. Every rule except STX007 evaluates
**only on transfer-like / asset-moving calls**; STX007 is file-level. Default
severities come from the rule catalog and are overridable per rule in
[configuration](config.md).

A call is **transfer-like** when its resolved `functionName` is one of the configured
[`transferLikeFunctionNames`](config.md), or its target contract matches an entry in
[`assetContracts`](config.md). If `functionName` cannot be resolved to a string
literal, the call is skipped rather than guessed at, so dynamic code does not produce
false positives.

## Post-condition precedence (no double-flagging)

A call's `postConditions` property reduces to one state, and each state is owned by a
single rule, so one call is never flagged by more than one of these:

- **absent** → STX001 only.
- **empty** (`[]`) → STX002 only.
- **present** (non-empty) → STX005 / STX006 (asset-specific presence checks).

STX003 and STX004 concern `postConditionMode` and are independent of the array (and
mutually exclusive with each other). STX007 is independent of everything.

---

<a id="stx001"></a>
## STX001 — Missing post-conditions

**Severity:** error

Fires when a transfer-like call's options have no `postConditions` property. With no
post-conditions the wallet cannot constrain what the transaction moves.

```ts
// Flagged
makeContractCall({
  contractAddress: 'SP…', contractName: 'my-token', functionName: 'transfer',
  functionArgs: [recipient, amount],
});

// Fixed
makeContractCall({
  contractAddress: 'SP…', contractName: 'my-token', functionName: 'transfer',
  functionArgs: [recipient, amount],
  postConditionMode: PostConditionMode.Deny,
  postConditions: [Pc.principal(sender).willSendEq(amount).ft('SP….my-token', 'my-token')],
});
```

**Fix:** Add `postConditions` covering each asset this call transfers, and set
`postConditionMode` to `Deny`.

---

<a id="stx002"></a>
## STX002 — Empty post-conditions

**Severity:** error

Fires when `postConditions` is an explicit empty array `[]` on a transfer-like call.
An empty array enforces nothing but reads as a deliberate choice, so it is flagged
distinctly from the absent case (STX001).

```ts
// Flagged
makeContractCall({ /* … */ functionName: 'transfer', postConditions: [] });
```

**Fix:** Replace the empty array with conditions for each asset the call transfers.

---

<a id="stx003"></a>
## STX003 — Permissive post-condition mode

**Severity:** error

Fires when `postConditionMode` resolves to `Allow` (the `PostConditionMode.Allow`
enum or the `'allow'` string). Allow mode disables post-condition enforcement, so even
post-conditions that are present are not enforced.

```ts
// Flagged
makeContractCall({ /* … */ functionName: 'transfer', postConditionMode: PostConditionMode.Allow });

// Fixed
makeContractCall({ /* … */ functionName: 'transfer', postConditionMode: PostConditionMode.Deny });
```

**Fix:** Use `PostConditionMode.Deny` so transfers not covered by a post-condition are
rejected.

---

<a id="stx004"></a>
## STX004 — Unspecified post-condition mode

**Severity:** warn

Fires when a transfer-like call does not set `postConditionMode` at all. Leaving it
unset relies on a default rather than an explicit `Deny`; making the intent explicit
avoids surprises.

**Fix:** Set `postConditionMode` explicitly to `Deny` rather than relying on the
default.

---

<a id="stx005"></a>
## STX005 — Missing fungible-token post-condition

**Severity:** error

Fires when a call targets a configured SIP-010 / sBTC asset contract (an
`assetContracts` entry of type `sip010`), supplies a **present** post-conditions
array, but no fungible-token condition is detected. The transfer is constrained for
other assets while the token it actually moves is left unguarded.

Detection is **presence-based**: any `Pc(...).ft(...)` condition satisfies the rule;
opaque or dynamic arrays are treated as satisfying to avoid false positives.

```ts
// Flagged — constrains STX, not the sBTC token being moved
makeContractCall({
  contractAddress: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4', contractName: 'sbtc-token',
  functionName: 'transfer', postConditionMode: PostConditionMode.Deny,
  postConditions: [Pc.principal(sender).willSendEq(amount).ustx()],
});

// Fixed
postConditions: [Pc.principal(sender).willSendEq(amount).ft('SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token', 'sbtc')]
```

**Fix:** Add a `Pc(...).ft(...)` post-condition for the token this call moves.

---

<a id="stx006"></a>
## STX006 — Missing STX or NFT post-condition

**Severity:** warn (configurable to error)

Fires when a call moves STX or an NFT (per a configured `assetContracts` entry of type
`stx` or `nft`), supplies a present post-conditions array, but no matching STX/NFT
condition is detected. `Pc(...).ustx()` satisfies the STX case and `Pc(...).nft(...)`
the NFT case.

Because this rule keys on configured asset contracts, you map your STX/NFT contracts
in [configuration](config.md); raise it to `error` there if you want it to fail CI.

**Fix:** Add a `Pc(...).ustx()` or `Pc(...).nft(...)` post-condition for the asset
this call moves.

---

<a id="stx007"></a>
## STX007 — Signing key in transaction-building code

**Severity:** error

Fires on any `senderKey` property used anywhere in a scanned file (both `senderKey: …`
and the shorthand `{ senderKey }`). A `senderKey` is a raw private key; signing in
application code means a private key is present in the frontend bundle. Scoping is left
to your `include`/`exclude` globs.

```ts
// Flagged
makeContractCall({ /* … */ senderKey: process.env.SIGNER_KEY });

// Fixed — sign through the user's wallet via Stacks Connect
request('stx_callContract', { /* … */ });
```

**Fix:** Sign with a wallet or Stacks Connect instead of embedding a `senderKey` in
application code.

---

## Suppressing a finding

Any finding can be silenced inline with a justified directive on the preceding line:

```ts
// stx-tx-guard-disable-next-line STX004 -- amount is fixed and validated upstream
makeContractCall(options);
```

The `-- <reason>` is mandatory. A directive without a reason does not suppress and
emits a notice instead. See the [README](../README.md#inline-suppression).
