# Non-goals

`stx-tx-guard` is a focused guardrail. To keep its scope honest, it is explicitly
**not**:

- a wallet;
- a hosted API or service;
- a smart-contract audit;
- a formal verifier;
- a replacement for [Clarinet](https://docs.hiro.so/clarinet);
- a replacement for [Stacks.js](https://stacks.js.org);
- a replacement for [Stacks Connect](https://docs.hiro.so/stacks.js/connect);
- a transaction signing tool;
- a transaction broadcasting service;
- a guarantee that all post-conditions are correct or that a transaction is safe.

It **is**: a local and CI-friendly guardrail for common unsafe post-condition patterns
in application transaction code.

This scoping is intentional. The tool complements the existing Stacks tooling stack at
the app transaction layer rather than overlapping with it — see
[How it complements the stack](complements.md) — and its analysis has clear
[limitations](limitations.md).
