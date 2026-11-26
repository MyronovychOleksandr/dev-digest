# Insights: server

## What Works

## What Doesn't Work

## Codebase Patterns

- 2026-11-26 [pattern] A run row turns terminal (`completeAgentRun`) before its trace is saved, so right after `waitForPrRuns` returns, `GET /runs/:id/trace` can still 404 → in tests poll the trace route until 200. Evidence: server/src/modules/reviews/run-executor.ts:249, server/src/modules/reviews/run-executor.ts:297, server/test/helpers/runs.ts:23

## Tool & Library Notes

- 2026-11-26 [tool] The integration test "run all enabled agents" mocks only the openai LLM, but seeded agents use openrouter → with a real `OPENROUTER_API_KEY` it can make paid calls. Run `*.it.test.ts` with `USERPROFILE`/`HOME` set to an empty dir (hides `~/.devdigest/secrets.json`), the API key env vars set empty, and `DOCKER_CONFIG` pointing at the real `~/.docker`. Evidence: server/test/reviews.it.test.ts:400

## Recurring Errors & Fixes

- 2026-11-26 [error] On Windows 8 unit tests fail for platform reasons: 6 in `indexer-pipeline` (ENOENT, the helper splits paths on `/` only) and 2 in `git-adapter-safety` (backslash paths, CRLF checkout) → do not treat them as a regression from unrelated changes. Evidence: server/test/indexer-pipeline.test.ts:142, server/test/git-adapter-safety.test.ts:45, server/test/git-adapter-safety.test.ts:68

## Session Notes

## Open Questions
