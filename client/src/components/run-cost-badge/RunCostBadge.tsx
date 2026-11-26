/* RunCostBadge — the recorded cost of one review run. `compact` is the price
   alone (list column, accordion header); `detailed` adds token usage (verdict
   banner). Unknown cost reads "—", never a made-up price. */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@devdigest/ui";
import { formatCost, formatTokenFlow } from "@/lib/format-run";
import { s } from "./styles";

export function RunCostBadge({
  costUsd,
  tokensIn,
  tokensOut,
  variant = "compact",
}: {
  costUsd: number | null | undefined;
  tokensIn?: number | null;
  tokensOut?: number | null;
  variant?: "compact" | "detailed";
}) {
  const t = useTranslations("prReview");
  const cost = formatCost(costUsd);
  const tokens = variant === "detailed" ? formatTokenFlow(tokensIn, tokensOut) : null;
  return (
    <span title={t(tokens ? "runCost.labelWithTokens" : "runCost.label")} style={s.wrap}>
      <Badge mono bg="transparent" color={s.color(costUsd != null)} style={s.badge}>
        {tokens ? `${cost} · ${tokens}` : cost}
      </Badge>
    </span>
  );
}

export default RunCostBadge;
