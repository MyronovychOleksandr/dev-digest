import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { FindingRecord } from "@devdigest/shared";
import messages from "../../../../../../../../messages/en/prReview.json";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock("../../../../../../../lib/hooks/reviews", () => ({
  useFindingAction: () => ({ mutate, isPending: false }),
}));

import { FindingsPanel } from "./FindingsPanel";

afterEach(() => {
  cleanup();
  mutate.mockClear();
});

function finding(overrides: Partial<FindingRecord> & { id: string; title: string }): FindingRecord {
  return {
    severity: "CRITICAL",
    category: "security",
    file: "src/config.ts",
    start_line: 11,
    end_line: 11,
    rationale: "A secret is committed.",
    suggestion: null,
    confidence: 0.95,
    kind: "finding",
    trifecta_components: null,
    evidence: null,
    review_id: "r1",
    accepted_at: null,
    dismissed_at: null,
    ...overrides,
  };
}

const CRITICAL = finding({ id: "f1", title: "Hardcoded secret" });
const WARNING_LOW = finding({ id: "f2", title: "Weak hash", severity: "WARNING", confidence: 0.4 });
const WARNING_HIGH = finding({ id: "f3", title: "No rate limit", severity: "WARNING" });
const SUGGESTION_LOW = finding({
  id: "f4",
  title: "Rename helper",
  severity: "SUGGESTION",
  confidence: 0.3,
});

// Deliberately unsorted: the panel orders by severity itself.
const MIXED = [SUGGESTION_LOW, WARNING_LOW, CRITICAL, WARNING_HIGH];

function withIntl(ui: React.ReactElement) {
  return (
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      {ui}
    </NextIntlClientProvider>
  );
}

function renderPanel(findings: FindingRecord[]) {
  return render(withIntl(<FindingsPanel findings={findings} prId="pr1" />));
}

const chipGroup = () => screen.getByRole("group", { name: "Filter by severity" });
const chipTexts = () =>
  within(chipGroup())
    .queryAllByRole("button")
    .map((b) => b.textContent);
const chip = (name: string) => within(chipGroup()).getByRole("button", { name });
const hideLowSwitch = () => screen.getByRole("switch");
const shownTitles = () =>
  MIXED.map((f) => f.title).filter((title) => screen.queryByText(title) !== null);
const press = (key: string) => fireEvent.keyDown(window, { key });

describe("FindingsPanel (smoke)", () => {
  it("renders the toolbar + a finding card", () => {
    renderPanel([CRITICAL]);
    expect(screen.getByText("Hide low confidence")).toBeInTheDocument();
    expect(screen.getByText("Hardcoded secret")).toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", () => {
    renderPanel([]);
    expect(screen.getByText("No findings match")).toBeInTheDocument();
  });
});

describe("FindingsPanel severity counters", () => {
  it("counts findings per level, in contract order", () => {
    renderPanel(MIXED);
    expect(chipTexts()).toEqual(["1 Critical", "2 Warning", "1 Suggestion"]);
  });

  it("omits a level with no findings", () => {
    renderPanel([WARNING_HIGH, SUGGESTION_LOW]);
    expect(chipTexts()).toEqual(["1 Warning", "1 Suggestion"]);
  });

  it("shows no chips for a run without findings", () => {
    renderPanel([]);
    expect(chipTexts()).toEqual([]);
  });

  it("filters by the clicked level and clears on a second click", () => {
    renderPanel(MIXED);
    fireEvent.click(chip("2 Warning"));
    expect(chip("2 Warning")).toHaveAttribute("aria-pressed", "true");
    expect(shownTitles()).toEqual(["Weak hash", "No rate limit"]);

    fireEvent.click(chip("2 Warning"));
    expect(chip("2 Warning")).toHaveAttribute("aria-pressed", "false");
    expect(shownTitles()).toHaveLength(MIXED.length);
  });

  it("keeps only one level active", () => {
    renderPanel(MIXED);
    fireEvent.click(chip("1 Critical"));
    fireEvent.click(chip("2 Warning"));
    expect(chip("1 Critical")).toHaveAttribute("aria-pressed", "false");
    expect(chip("2 Warning")).toHaveAttribute("aria-pressed", "true");
    expect(shownTitles()).toEqual(["Weak hash", "No rate limit"]);
  });

  it("applies together with Hide low confidence without changing the counts", () => {
    renderPanel(MIXED);
    fireEvent.click(hideLowSwitch());
    fireEvent.click(chip("2 Warning"));
    expect(shownTitles()).toEqual(["No rate limit"]);
    expect(chipTexts()).toEqual(["1 Critical", "2 Warning", "1 Suggestion"]);
  });

  it("shows the empty state when both filters leave nothing, and can be cleared", () => {
    renderPanel(MIXED);
    fireEvent.click(chip("1 Suggestion"));
    fireEvent.click(hideLowSwitch());
    expect(screen.getByText("No findings match")).toBeInTheDocument();

    fireEvent.click(chip("1 Suggestion"));
    expect(shownTitles()).toEqual(["Hardcoded secret", "No rate limit"]);
  });

  it("does not call the server when filtering", () => {
    renderPanel(MIXED);
    fireEvent.click(chip("1 Critical"));
    fireEvent.click(chip("1 Critical"));
    expect(mutate).not.toHaveBeenCalled();
  });

  it("keeps counts and filter in step with the list after accept/dismiss", () => {
    const { rerender, container } = renderPanel(MIXED);
    fireEvent.click(chip("2 Warning"));

    const at = "2026-11-26T10:00:00.000Z";
    const updated = [
      SUGGESTION_LOW,
      { ...WARNING_LOW, dismissed_at: at },
      CRITICAL,
      { ...WARNING_HIGH, accepted_at: at },
    ];
    rerender(withIntl(<FindingsPanel findings={updated} prId="pr1" />));

    expect(chip("2 Warning")).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelectorAll("[data-finding-id]")).toHaveLength(2);
  });

  it("resets keyboard focus when the severity filter changes", () => {
    renderPanel(MIXED);
    press("j");
    press("j");
    fireEvent.click(chip("2 Warning"));
    press("a");
    expect(mutate).toHaveBeenCalledWith({ findingId: "f2", action: "accept", prId: "pr1" });
  });

  it("resets keyboard focus when Hide low confidence changes", () => {
    renderPanel(MIXED);
    press("j");
    fireEvent.click(hideLowSwitch());
    press("d");
    expect(mutate).toHaveBeenCalledWith({ findingId: "f1", action: "dismiss", prId: "pr1" });
  });
});
