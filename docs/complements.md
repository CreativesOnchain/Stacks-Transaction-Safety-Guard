# How it complements the stack

Stacks already has strong tooling for building contracts and transactions. The
remaining gap is the **application transaction layer**: does the frontend/app code that
constructs a transaction actually include safe post-condition patterns?
`stx-tx-guard` checks exactly that, and complements the existing tools rather than
replacing any of them.

| Tool | Layer | What it does | What it does **not** do |
| --- | --- | --- | --- |
| **Clarinet** | Clarity contracts | Build, test, validate, and deploy contracts | Check the app code that calls them |
| **Stacks.js** | Transaction construction | Build and sign transactions, including post-conditions | Tell you when your code omits or weakens those post-conditions |
| **Stacks Connect** | Wallet interaction | Request wallet signing/broadcast from the app | Review how the request was constructed |
| **Wallets** | Signing & display | Show declared post-conditions to the user before broadcast | Catch a missing post-condition before the transaction is built |
| **stx-tx-guard** | App transaction code | Statically flag missing/unsafe post-condition patterns in `makeContractCall` / `request` / `broadcastTransaction` usage, locally and in CI | Replace any of the above; prove correctness |

A Clarity contract can be valid while the app code that calls it omits post-conditions,
uses the permissive `allow` mode, or exposes a signing key. Post-conditions are
constructed in app code with Stacks.js and shown by wallets before broadcast — so the
earliest place to catch these mistakes is in the app code itself, in local development
and CI. That is where `stx-tx-guard` fits.

See the [rule reference](rules.md) for the specific patterns it checks and
[Non-goals](non-goals.md) for where it intentionally stops.
