# CI guide

`stx-tx-guard` is built to run in continuous integration: scan your transaction code
on every pull request and fail the build when an unsafe pattern slips in.

## Exit codes (Model A)

- Any **error**-level finding → exit `1`.
- Only warnings (or nothing) → exit `0`.
- With `--strict`, warnings escalate to errors, so they also exit `1`.

Run with `--strict` in CI so warnings such as STX004 (unspecified mode) fail the
build instead of being ignored.

## GitHub Actions

A complete example workflow ships at
[`.github/workflows/tx-guard.yml`](../.github/workflows/tx-guard.yml). For your own
project, once `stx-tx-guard` is installed (or published), the core of a workflow is:

```yaml
name: tx-guard

on:
  push:
    branches: [main]
  pull_request:

jobs:
  tx-guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx stx-tx-guard scan ./src --strict --report markdown
```

The `--report markdown` output is convenient to paste into a job summary or a PR
comment. Use `--report json` if a later step needs to parse the findings
programmatically.

## Scanning a specific path

The positional argument is the scan root; the config's `include`/`exclude` globs
apply within it. Point it at the directory that holds your transaction-building code:

```bash
npx stx-tx-guard scan ./src --strict
npx stx-tx-guard scan ./app --strict --config ./stx-tx-guard.config.json
```

## Dogfooding this repository

This repo's workflow scans its own bundled examples. It gates on the safe and
no-transfer demos passing under `--strict`, and demonstrates the unsafe demo failing
by inverting that step's exit code so the job stays green while still proving
detection works:

```yaml
- name: Scan unsafe example (expected to fail)
  run: |
    if node dist/cli/bin.js scan examples/unsafe-sbtc-transfer --strict --report markdown; then
      echo "::error::unsafe example unexpectedly passed the scan"; exit 1
    else
      echo "unsafe example correctly failed strict scanning"
    fi
```

In your own project you would not invert the exit code — you *want* CI to fail on an
unsafe finding. See [configuration](config.md) for tuning rule severities per project
and the [rule reference](rules.md) for what each rule checks.
