# Limitations

`stx-tx-guard` catches **common, high-impact** post-condition mistakes through static
analysis. It is deliberately conservative — it favors avoiding false positives — so it
will not catch every unsafe transaction. Know these boundaries:

- **No cross-file or dynamic data flow.** Options are resolved only when they are an
  inline object literal or a single same-file `const` initialized directly to an
  object literal. Options that are reassigned, imported, passed as a parameter, or
  computed are treated as unresolved and skipped — no finding is produced.

- **Unresolvable call identity is skipped.** If a call's `functionName` (or contract
  identifier) is not a string literal, the call is not classified as transfer-like, so
  asset rules do not run on it. This avoids guessing, at the cost of missing
  dynamically-named calls.

- **Presence-based asset checks.** STX005/STX006 are satisfied by the *presence* of a
  matching post-condition (`Pc(...).ft/.ustx/.nft`). There is no exact-principal or
  exact-amount matching, so a post-condition that is present but semantically wrong for
  the transfer will pass.

- **Opaque and dynamic post-conditions pass conservatively.** Serialized string
  post-conditions, spreads (`...pcs`), and other non-literal array entries cannot be
  introspected and are treated as satisfying the asset checks, to avoid false
  positives. A genuinely insufficient dynamic array can therefore be missed.

- **Legacy Stacks.js v6 helpers are not detected.** Detection targets the modern `Pc`
  builder and the Stacks Connect `request` shape. The v6 `make*PostCondition` helpers
  are absent from the targeted `@stacks/transactions` v7 surface; best-effort legacy
  detection is deferred.

- **Recognized call shapes only.** The scanner understands `makeContractCall`,
  `request("stx_callContract", …)`, and `broadcastTransaction`. `broadcastTransaction`
  is detected for context only; no rule fires on it.

- **Not a correctness proof.** Post-conditions limit unexpected asset movement but are
  not a catch-all, and this tool does not prove a transaction or contract is safe.
  Security-minded development, testing, and review are still required.

For what the tool explicitly does not aim to be, see [Non-goals](non-goals.md).
