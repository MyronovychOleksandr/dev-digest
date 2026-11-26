# reviewer-core (`@devdigest/reviewer-core`)

## Boundaries

- No DB, GitHub or filesystem access. The only outside calls are to the LLM, through the injected `LLMProvider` (only `OpenRouterProvider` touches the network).
- Never emits JS: consumed as TypeScript source. Relative imports end in `.js`.

## API and contracts

- The public API is `src/index.ts`; changing its exports breaks the server. The README "Public API" section is stale.
- `agent-runner`, mentioned in comments, does not exist.
- Edit contracts in `../server/src/vendor/shared`. Zod `.describe()` text goes into the JSON Schema sent to the model.

## Invariants

- Grounding is mandatory.
- The score is recomputed from the findings that survive grounding.
- External content enters the prompt only through `wrapUntrusted`.
- `INJECTION_GUARD` is always appended. Don't add keyword filtering.

## Gotchas

- The engine's default strategy is `auto`, but the server passes `agent.strategy` (DB default `single-pass`).
- Tests import the server's mocks, and the CI path filter for this package does not cover them.

## Read when

- Changing the pipeline: `README.md`
- Needing module documentation: `docs/`
- Implementing or changing a feature: `specs/`
- Looking for past lessons: `INSIGHTS.md` (if present)
