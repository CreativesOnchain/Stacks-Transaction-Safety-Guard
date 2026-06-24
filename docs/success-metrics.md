# Success metrics

How the shipped MVP maps to the project's stated targets.

| Metric | Target | Status | Evidence |
| --- | --- | --- | --- |
| Open-source repo | 1 | ✅ | [github.com/steven3002/Stacks-Transaction-Safety-Guard](https://github.com/steven3002/Stacks-Transaction-Safety-Guard) (MIT). |
| CLI command shipped | `scan` | ✅ | `stx-tx-guard scan <path>` — `src/cli/parse-args.ts`, `src/cli/scan-command.ts`. |
| Report formats | terminal, markdown, JSON | ✅ | `src/report/{terminal,markdown,json}-report.ts`, selected via `--report`. |
| Core rules shipped | 7 | ✅ | STX001–STX007 in `src/rules/`; see the [rule reference](rules.md). |
| Example projects | 3 | ✅ | `examples/{unsafe-sbtc-transfer,safe-sbtc-transfer,no-transfer-contract-call}` (plus a minimal `unsafe-contract-call`). |
| GitHub Action example | 1 | ✅ | [`.github/workflows/tx-guard.yml`](../.github/workflows/tx-guard.yml). |
| Strict CI mode | working | ✅ | `--strict` escalates warn→error (`src/engine/resolve-severity.ts`); exit follows Model A. |
| Documentation pages | 5+ | ✅ | README + `docs/{rules,config,ci,limitations,non-goals,complements}.md` (+ this page and the demo). |
| Unsafe sBTC demo detection | working | ✅ | `npm run scan:unsafe` reports STX001, STX004, STX005, STX007 and exits `1`. |
| Safe sBTC demo | passes with no error-level findings | ✅ | `npm run scan:safe` exits `0`. |
| Demo GIF/video | 1 | ◻️ | Reproducible [demo guide](demo.md) with exact commands and expected output; a GIF/video can be recorded from it. |
| Installable package | npm or GitHub release | ◻️ | `package.json` is publish-ready (`bin`, `files`, `engines`, metadata); npm publish / GitHub release is the remaining release step. |

✅ delivered · ◻️ partially delivered (recorded asset / publish step pending)

Quality gates: `npm test` (unit + e2e) and `npm run typecheck` pass. The end-to-end
behaviour is verified through the built binary — see the [demo](demo.md).
