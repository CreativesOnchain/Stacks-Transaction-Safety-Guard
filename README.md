# stx-tx-guard

Post-condition safety checks for Stacks.js and Stacks Connect transaction code.

`stx-tx-guard` is a command-line tool (and, later, a GitHub Action) that statically
scans JavaScript/TypeScript application code for common **missing or unsafe Stacks
post-condition patterns** in transaction-building calls — `makeContractCall`,
`request("stx_callContract", …)`, and `broadcastTransaction`. It is a
production-readiness guardrail for high-impact mistakes, not an audit or a verifier.

> Status: early development. This README is a stub; full usage, configuration, and CI
> docs land in a later milestone.

## What it checks

The rule pack grows across milestones. The first rules:

| Rule | Severity | Fires when a transfer-like call… |
| --- | --- | --- |
| STX001 | error | declares no post-conditions. |
| STX003 | error | sets `postConditionMode` to Allow (enforcement disabled). |
| STX004 | warn | does not set `postConditionMode` at all. |

Additional rules (empty post-conditions, fungible-token / STX / NFT coverage, and
signing-key usage) arrive in subsequent milestones.

## Setup

Requires Node.js 20+.

```bash
npm install
npm run build
```

## Usage

```bash
stx-tx-guard scan <path> [--report terminal] [--strict] [--config <file>]
```

- `<path>` — a directory (the scan root, with `include`/`exclude` globs applied
  within it) or a single file.
- `--report` — output format: `terminal` (default), `markdown` (for PR comments /
  CI logs), or `json` (a stable machine-readable schema).
- `--strict` — treat warnings as errors so they fail CI.
- `--config` — path to a configuration file; otherwise `stx-tx-guard.config.json`
  in the working directory is used, falling back to built-in defaults.

Exit code follows **Model A**: any error-level finding exits `1`, otherwise `0`.
With `--strict`, warnings escalate to errors and also fail the run.

Try it against the bundled examples:

```bash
stx-tx-guard scan examples/no-transfer-contract-call   # exits 0, no findings
stx-tx-guard scan examples/unsafe-contract-call        # exits 1, reports STX001
```

## Non-goals

- Not an audit, formal verifier, wallet, signer, or broadcaster, and not a proof of
  transaction correctness.
- Not a replacement for Clarinet, Stacks.js, or Stacks Connect — it complements them
  at the application transaction layer.
- Catches **common** high-impact patterns via static analysis only; it does not
  follow cross-file or dynamic data flow, and it never imports or runs Stacks.js.

## License

MIT
