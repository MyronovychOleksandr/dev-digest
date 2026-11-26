# server (`@devdigest/api`)

## Module anatomy

- `src/modules/<name>/` has `routes.ts` and, as needed, `service.ts`, `repository.ts`, `helpers.ts`, `constants.ts`.
- Registration is static: add the module to `src/modules/index.ts`. `@fastify/autoload` is a dependency but unused.

## Imports

- Relative imports end in `.js`, except in `src/db/schema.ts` and `src/db/schema/*` (extensionless).

## Routes

- Use `withTypeProvider<ZodTypeProvider>()` with `schema: { params, body }`. Invalid input returns 422.
- `IdParams` is for uuid ids only.
- Scope data by `workspaceId` from `getContext`.
- Throw `AppError` subclasses.

## Dependency injection

- Adapters go through `src/platform/container.ts`: interface, implementation, getter, `ContainerOverrides` field, and a mock in `src/adapters/mocks.ts`.
- External-service interfaces live in shared `adapters.ts`; internal ones (`DepGraph`, `Tokenizer`) sit beside their adapter.
- Features use repo-intel only through its facade, never the underlying libraries.

## Not what it seems

- `src/platform/{prompt,grounding,structured}.ts` are re-exports: edit the code in `reviewer-core`.
- `src/db/seed-prompts.ts` mirrors `../docs/agent-prompts`. Seed does not update existing agents; at run time the DB is the source of truth.
- The `vector` extension is created by `src/db/migrate.ts`, not by migration 0000 (both READMEs say otherwise).

## Runtime

- One API instance per DB: boot marks every `running` run as failed.
- Reviews are fire-and-forget. Tests wait with `test/helpers/runs.ts`.
- Register a job handler before `enqueue`, and make it safe to retry.

## Security (do not weaken)

- Secrets only through `SecretsProvider`.
- Rebuild clone URLs from validated owner/name; never put the token in a URL.
- Keep the git env allow-list and the `rg` flags.
- Keep the Host/Origin guard: the API has no auth.

## Tests

- Tests live in `test/`. DB-backed tests must be named `*.it.test.ts`.
- Unit: `pnpm exec vitest run --exclude '**/*.it.test.ts'`
- Integration: `pnpm exec vitest run .it.test`. Without Docker they skip with only a warning, so green does not mean they ran.
- Unit tests can write to the dev DB: some call `buildApp` without `db`, config loads `.env`, and boot fails all `running` runs. Run them with `DATABASE_URL` pointing at a closed port.
- `test/` is not covered by `pnpm typecheck`.

## Gotchas

- `pnpm build` / `pnpm start` do not produce a runnable server (path aliases are not rewritten, the `dist/` layout differs, prompts are not copied). Run through `tsx`.
- `src/adapters/depgraph/index.ts` and `src/modules/repo-intel/pipeline/repo-map.ts` contain a NUL byte: grep treats them as binary.

## Read when

- DI flow, API map, environment: `README.md`
- Working on the indexer: `src/modules/repo-intel/README.md`
- Adding or changing env variables: `.env.example`
- Needing module documentation: `docs/`
- Implementing or changing a feature: `specs/`
- Looking for past lessons: `INSIGHTS.md` (if present)
