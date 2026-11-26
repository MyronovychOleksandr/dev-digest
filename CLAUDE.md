# DevDigest

Local-first AI pull-request reviewer. This repo is the starter.

## Stack

- Node >= 22, pnpm >= 10, TypeScript 5 (strict)
- `client/`: Next.js 15, React 19
- `server/`: Fastify 5, Drizzle ORM 0.45, Postgres 16 + pgvector
- Zod 3 (not 4)
- Vitest 2

## Layout

- `client/`: web UI
- `server/`: API
- `reviewer-core/`: pure review engine
- `e2e/`: browser flows
- `scripts/`: bootstrap and hermetic e2e
- `docs/agent-prompts/`: reviewer prompts

Not a workspace: there is no root `package.json`, and each package has its own dependencies.

## Commands

From the root:

```sh
./scripts/dev.sh        # Postgres, migrate, seed, API :3001, web :3000
                        # flags: --db-only --no-seed --no-client
./scripts/e2e.sh        # isolated stack + browser flows
```

Per package (run inside the package directory; there are no root or lint scripts):

| Package | Package manager | Commands |
|---|---|---|
| `client/`, `server/` | pnpm | `pnpm dev`, `pnpm test`, `pnpm typecheck` |
| `reviewer-core/`, `e2e/` | npm | `npm ci`, `npm test`, `npm run typecheck` |

## Module docs

Each module: `docs/` = module documentation, `specs/` = feature specs, `INSIGHTS.md` = lessons (a skill will create it; don't create it by hand).

## Cross-package

- `@devdigest/shared` exists as two copies, `server/src/vendor/shared` and `client/src/vendor/shared`, and they have already diverged. Apply a contract change to both; never copy a whole file over the other.
- `reviewer-core` reads the server copy.
- The server imports raw TypeScript from `reviewer-core`: without `npm ci` there, the API neither boots nor typechecks.
- A new path alias goes into both `tsconfig.json` and `vitest.config.ts`.

## Naming

- DB columns are snake_case, their TypeScript keys camelCase.
- API DTOs are snake_case, but some request fields are camelCase (`agentId`): check the schema.

## Gotchas

- Windows: `pnpm db:migrate` and `pnpm db:seed` exit without doing anything (the `import.meta.url` guard in `migrate.ts` and `seed.ts`). They worked only if the output shows `✓`. This also affects `dev.sh` and `e2e.sh`.
- Migrations do not run on API boot.
- Use only the root `docker-compose.yml`. `server/docker-compose.yml` duplicates it and exposes the port on all interfaces.
- `~/.devdigest/secrets.json` overrides `.env`.
- Seeded agents need `OPENROUTER_API_KEY` (the README does not mention it).

## Do not touch

- `server/src/db/migrations/**`: change the schema, then run `pnpm db:generate`.
- Lock files (`pnpm-lock.yaml`, `package-lock.json`): never mix package managers.
- `client/next-env.d.ts` (generated).
- `.github/workflows/*`: path filters encode cross-package dependencies.
- Vendored skills listed in `skills-lock.json`, and `skills-lock.json` itself. Adding and editing our own skills in `.claude/skills/` is fine.
- Never run `docker compose down -v` unless explicitly asked: the README suggests it, but it destroys all data.
- `**/vendor/**` inside packages is first-party code and may be edited.

## Read when

- Setting up from zero or troubleshooting: `README.md`
- Working on tests or CI: `TESTING.md`
- Editing agent prompts: `docs/agent-prompts/README.md`
- Choosing a model: `docs/agent-prompts/choosing-a-model.md`
- Working in a module: its `README.md` and `INSIGHTS.md` (if present)
