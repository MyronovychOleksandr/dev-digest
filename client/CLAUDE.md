# client (`@devdigest/web`)

## Layout

- Route-local components: `src/app/<route>/_components/<Name>/` with `<Name>.tsx`, `index.ts`, optional `styles.ts`, `constants.ts`, `helpers.ts`, and the test beside them.
- Shared components: `src/components/<kebab-case>/`.

## Styling

- Inline style objects plus CSS variables. No Tailwind utility classes (only global ones such as `mono`, `tnum`). Don't hard-code theme colors.
- Import UI only from the `@devdigest/ui` barrel.

## Shared contracts

- Use only `import type` from `@devdigest/shared`: webpack cannot resolve its `.js` re-exports.
- That is why `src/lib/feature-models.ts` is a hand-kept mirror of the shared registry.

## Data

- Go through `src/lib/hooks/*` and `src/lib/api.ts`.
- Don't send `content-type: application/json` without a body.
- Mutation errors already toast globally (don't add a second toast). SSE errors bypass the global toast.
- The PR URL carries the PR number; PR APIs expect the row uuid.

## i18n

- Strings go in `messages/en/<namespace>.json`; a new namespace is picked up automatically.

## Security (do not weaken)

- CSP restricts `connect-src` and `img-src`.
- Markdown never renders images.
- Keep the no-flash theme script and `suppressHydrationWarning`.

## Tests

- `@testing-library/user-event` is not installed: use `fireEvent`.
- Wrap components that use translations in `NextIntlClientProvider`.
- There is no `/showcase` route (docs say otherwise): `src/components/showcase` is mounted only by `src/test/smoke.test.tsx`.

## Read when

- Needing the route map: `README.md`
- Working with UI components or tokens: `src/vendor/ui/README.md`
- Needing module documentation: `docs/`
- Implementing or changing a feature: `specs/`
- Looking for past lessons: `INSIGHTS.md` (if present)
