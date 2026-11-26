# Insights: client

## What Works

## What Doesn't Work

## Codebase Patterns

## Tool & Library Notes

## Recurring Errors & Fixes

## Session Notes

## Open Questions

- 2026-11-26 [question] `RunStatus` is mounted only while `liveRunIds` is non-empty, and that list comes from a 4 s poll. If the poll empties it before the SSE stream closes, `onDone` (the PR page's query invalidations) may never fire. Not reproduced → verify before relying on `onDone` for freshness. Evidence: client/src/app/repos/[repoId]/pulls/[number]/_components/FindingsTab/FindingsTab.tsx:82, client/src/lib/hooks/reviews.ts:33
