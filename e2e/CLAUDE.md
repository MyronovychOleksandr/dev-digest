# e2e (`@devdigest/e2e`)

## How flows work

- Not Playwright: flows are JSON files, `specs/NN-name.flow.json`, run by the globally installed `agent-browser` CLI.
- They run in lexical order in one browser session; `{BASE}` is substituted.
- `wait --text` / `wait --url` are the assertions. A flow stops at its first failure.
- Deterministic locators only, never `chat`. No LLM calls; rely only on read-only seeded data.

## Running

- Flows need a fresh DB containing only the seeded repo: use `../scripts/e2e.sh` (isolated stack), not your dev DB.
- Changing UI strings (`../client/messages`) or seed data can break flows.
- CI serves a built web app (`build` + `start`); the local script runs `next dev`.

## Read when

- Needing the flow format or env knobs: `README.md`
- Needing module documentation: `docs/`
- Adding or changing a flow: `specs/`
- Looking for past lessons: `INSIGHTS.md` (if present)
