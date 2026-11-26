import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReviewRecord, RunSummary } from "@devdigest/shared";
import messages from "../../../../../../../../messages/en/prReview.json";
import { ReviewRunAccordion } from "./ReviewRunAccordion";

vi.mock("../../../../../../../lib/hooks/reviews", () => ({
  useDeleteReview: () => ({ mutate: () => {}, isPending: false }),
}));
vi.mock("../FindingsPanel", () => ({ FindingsPanel: () => null }));

afterEach(cleanup);

const REVIEW: ReviewRecord = {
  id: "rev-1",
  pr_id: "pr-1",
  agent_id: "a1",
  run_id: "run-1",
  agent_name: "Security Reviewer",
  kind: "review",
  verdict: "request_changes",
  summary: "Hardcoded secret.",
  score: 38,
  model: "deepseek/deepseek-v4-flash",
  created_at: "2026-06-13T20:52:51.000Z",
  findings: [],
};

const RUN: RunSummary = {
  run_id: "run-1",
  agent_id: "a1",
  agent_name: "Security Reviewer",
  provider: "openrouter",
  model: "deepseek/deepseek-v4-flash",
  status: "done",
  error: null,
  duration_ms: 8200,
  tokens_in: 8200,
  tokens_out: 1300,
  cost_usd: 0.014,
  findings_count: 0,
  grounding: "0/0 passed",
  ran_at: "2026-06-13T20:52:43.000Z",
  score: 38,
  blockers: 0,
};

function renderAccordion(run?: RunSummary) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      <ReviewRunAccordion review={REVIEW} run={run} prId="pr-1" defaultOpen />
    </NextIntlClientProvider>,
  );
}

describe("ReviewRunAccordion — run cost", () => {
  it("shows the price in the header and price · tokens in the verdict banner", () => {
    renderAccordion(RUN);
    expect(screen.getByTitle("Run cost")).toHaveTextContent("$0.014");
    expect(screen.getByTitle("Run cost · tokens in→out")).toHaveTextContent("$0.014 · 8.2K→1.3K");
  });

  it("shows dashes when the review has no run (e.g. seeded data)", () => {
    renderAccordion(undefined);
    const badges = screen.getAllByTitle("Run cost");
    expect(badges).toHaveLength(2);
    for (const badge of badges) expect(badge).toHaveTextContent("—");
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });
});
