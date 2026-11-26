/** Formatting of a run's recorded cost and token usage. */

const UNKNOWN = "—";

/**
 * USD cost. Below $1: 3 significant digits, trailing zeros trimmed down to at
 * least 3 decimals ($0.0123, $0.012, $0.060). From $1: cents. Unknown → "—";
 * a recorded 0 (free model) is real data and reads "$0.000".
 */
export function formatCost(usd: number | null | undefined): string {
  if (usd == null || !Number.isFinite(usd) || usd < 0) return UNKNOWN;
  if (usd === 0) return "$0.000";
  const rounded = Number(usd.toPrecision(3));
  if (rounded >= 1) return `$${usd.toFixed(2)}`;
  const decimals = Math.min(100, Math.max(3, 2 - Math.floor(Math.log10(rounded))));
  return `$${rounded.toFixed(decimals).replace(/(\.\d{3}\d*?)0+$/, "$1")}`;
}

function compactTokens(n: number): string {
  return n < 1000 ? String(n) : `${(n / 1000).toFixed(1)}K`;
}

/** Token in→out summary ("8.2K→1.3K"); null when there is no usage to show. */
export function formatTokenFlow(
  tokensIn: number | null | undefined,
  tokensOut: number | null | undefined,
): string | null {
  if (tokensIn == null || tokensOut == null) return null;
  if (tokensIn === 0 && tokensOut === 0) return null;
  return `${compactTokens(tokensIn)}→${compactTokens(tokensOut)}`;
}
