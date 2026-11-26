# Insights: client

## What Works

## What Doesn't Work

## Codebase Patterns

## Tool & Library Notes

## Recurring Errors & Fixes

- 2026-11-26 [error] Tests that move FindingCard focus print React's "Updating a style property during rerender (borderColor) … (borderLeftColor)" → it is not caused by your change. It is a real defect: a focus-only update of `borderColor` also overwrites the left side, so a card that loses focus should lose its severity stripe colour (confirmed with jsdom style semantics, not in a browser). Evidence: client/src/app/repos/[repoId]/pulls/[number]/_components/FindingCard/styles.ts:10, client/src/app/repos/[repoId]/pulls/[number]/_components/FindingCard/styles.ts:13

## Session Notes

## Open Questions

- 2026-11-26 [question] `RunStatus` is mounted only while `liveRunIds` is non-empty, and that list comes from a 4 s poll. If the poll empties it before the SSE stream closes, `onDone` (the PR page's query invalidations) may never fire. Not reproduced → verify before relying on `onDone` for freshness. Evidence: client/src/app/repos/[repoId]/pulls/[number]/_components/FindingsTab/FindingsTab.tsx:82, client/src/lib/hooks/reviews.ts:33
