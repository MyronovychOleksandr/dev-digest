import type { CSSProperties } from "react";

/** Co-located styles for RunCostBadge. */
export const s = {
  wrap: { display: "inline-flex" } satisfies CSSProperties,
  badge: { padding: 0, fontWeight: 400 } satisfies CSSProperties,
  color: (known: boolean): string => (known ? "var(--text-secondary)" : "var(--text-muted)"),
} as const;
