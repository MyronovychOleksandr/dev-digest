import type { CSSProperties } from "react";

/** Co-located styles for FindingsPanel (extracted from inline styles). */
export const s = {
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  } satisfies CSSProperties,
  divider: {
    width: 1,
    height: 18,
    background: "var(--border)",
    margin: "0 2px",
  } satisfies CSSProperties,
  severityGroup: { display: "flex", gap: 8, flexWrap: "wrap" } satisfies CSSProperties,
  /** Active chip is filled with its severity colour; the others are outline only. */
  severityChip: (color: string, active: boolean) =>
    ({
      padding: "4px 12px",
      borderRadius: 99,
      border: `1px solid ${color}`,
      background: active ? color : "transparent",
      color: active ? "#fff" : color,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      cursor: "pointer",
    }) satisfies CSSProperties,
  toggleGroup: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "var(--text-secondary)",
  } satisfies CSSProperties,
  list: { display: "flex", flexDirection: "column", gap: 12 } satisfies CSSProperties,
} as const;
