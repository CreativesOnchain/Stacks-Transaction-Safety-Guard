# stx-tx-guard

**Post-condition safety checks for Stacks.js and Stacks Connect transaction code.**

`stx-tx-guard` is a local CLI and GitHub Action that statically scans
JavaScript/TypeScript application code for common **missing or unsafe Stacks
post-condition patterns** in transaction-building calls — `makeContractCall`,
`request("stx_callContract", …)`, and `broadcastTransaction`. It turns a documented
Stacks safety practice into a practical local and CI workflow for sBTC, SIP-010,
STX, NFT, payment, and DeFi transaction flows.

It is a **production-readiness guardrail for common high-impact mistakes** — not an
audit, formal verifier, wallet, signer, or broadcaster, and not a proof of
transaction correctness. See [Non-goals](docs/non-goals.md).

> **Status:** early development (`0.1.0`), not yet published to npm. Install from
> source as shown below.

## The gap it fills

Post-conditions are not written inside Clarity contracts — they are constructed in
frontend/application code with Stacks.js and included in the signed transaction. A
valid contract can still be called by app code that omits post-conditions, uses the
permissive `allow` mode, or exposes a raw signing key. `stx-tx-guard` checks those
transaction-building code paths. It complements Clarinet, Stacks.js, and Stacks
Connect rather than replacing them — see [How it complements the stack](docs/complements.md).

## What it checks

| Rule | Severity | Fires when a transfer-like call… |
| --- | --- | --- |
| [STX001](docs/rules.md#stx001) | error | declares no `postConditions`. |
| [STX002](docs/rules.md#stx002) | error | has an empty `postConditions` array (`[]`). |
| [STX003](docs/rules.md#stx003) | error | sets `postConditionMode` to `Allow` (enforcement disabled). |
| [STX004](docs/rules.md#stx004) | warn | does not set `postConditionMode` at all. |
| [STX005](docs/rules.md#stx005) | error | moves a SIP-010 / sBTC token but no fungible-token post-condition is present. |
| [STX006](docs/rules.md#stx006) | warn | moves STX or an NFT but no matching post-condition is present. |
| [STX007](docs/rules.md#stx007) | error | a `senderKey` (a raw private key) appears anywhere in a scanned file. |

Full rationale, firing conditions, and before/after fixes are in the
[rule reference](docs/rules.md).

## Install

Requires **Node.js 20+**.

```bash
git clone https://github.com/steven3002/Stacks-Transaction-Safety-Guard.git
cd Stacks-Transaction-Safety-Guard
npm install
npm run build
```

This produces the executable at `dist/cli/bin.js`. Once the package is published,
the intended usage is `npx stx-tx-guard scan ./src`.

## Usage

```bash
node dist/cli/bin.js scan <path> [--report terminal|markdown|json] [--strict] [--config <file>]
```

- `<path>` — a directory (the scan root, with the config's `include`/`exclude`
  globs applied within it) or a single file.
- `--report` — output format: `terminal` (default), `markdown` (for PR comments and
  CI logs), or `json` (a stable machine-readable schema).
- `--strict` — treat warnings as errors so they also fail CI.
- `--config` — path to a configuration file; otherwise `stx-tx-guard.config.json` in
  the working directory is used, falling back to built-in defaults.

**Exit code (Model A):** any error-level finding exits `1`, otherwise `0`. With
`--strict`, warnings escalate to errors and also cause a non-zero exit.

### Try the bundled examples

```bash
npm run scan:unsafe        # examples/unsafe-sbtc-transfer  -> exits 1
npm run scan:safe          # examples/safe-sbtc-transfer    -> exits 0
npm run scan:no-transfer   # examples/no-transfer-contract-call -> exits 0
```

See the full walkthrough in the [demo guide](docs/demo.md).

## Reports

All formats include, per finding: file path, line, rule id, severity, message, and
suggested fix, plus a run summary (errors, warnings, files scanned). `terminal` is
human-readable, `markdown` renders a table for PRs/CI, and `json` is a stable schema
(`{ version, summary, findings[] }`) for tooling.

## Inline suppression

Silence a finding on the next line with a **mandatory** justification:

```ts
// stx-tx-guard-disable-next-line STX004 -- amount is fixed and validated upstream
makeContractCall(options);
```

Multiple rule ids may be listed (comma-separated). A directive **without** a reason
does not suppress anything and prints a notice instead, so unjustified silencing is
surfaced rather than honored.

## Configuration

Drop a `stx-tx-guard.config.json` in your project root to set rule severities, map
your own asset contracts, and define which function names count as transfer-like.
See the [configuration reference](docs/config.md). A sample config ships at the repo
root.

## Continuous integration

An example workflow lives at
[`.github/workflows/tx-guard.yml`](.github/workflows/tx-guard.yml). The
[CI guide](docs/ci.md) explains wiring it into GitHub Actions with `--strict` and a
markdown report.

## Documentation

- [Rule reference](docs/rules.md) — STX001–STX007 with rationale and fixes.
- [Configuration](docs/config.md) — schema and worked examples.
- [CI guide](docs/ci.md) — GitHub Action setup.
- [Limitations](docs/limitations.md) — what static analysis cannot catch.
- [Non-goals](docs/non-goals.md) — what this tool is not.
- [How it complements the stack](docs/complements.md) — positioning vs Clarinet / Stacks.js / Connect.
- [Demo](docs/demo.md) — end-to-end walkthrough.

## Development

```bash
npm run build       # compile src/ to dist/
npm run typecheck   # tsc --noEmit
npm test            # vitest (unit + e2e)
```

The tool **never imports or runs Stacks.js**; `@stacks/*` are dev-only dependencies
used to author the examples and verify API shapes. Parsing uses the TypeScript
Compiler API, so `.ts/.tsx/.js/.jsx` are scanned natively.

## License

MIT
