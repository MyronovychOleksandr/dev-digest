import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { PrMeta } from "@devdigest/shared";
import messages from "../../../../../../../messages/en/prReview.json";
import { COLUMN_KEYS, GRID } from "../../constants";
import { PRRow } from "./PRRow";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }) }));

afterEach(cleanup);

function renderRow(o: Partial<PrMeta>) {
  const pr: PrMeta = {
    number: 482,
    title: "Add rate limiting",
    author: "marisa.koch",
    branch: "feat/rl",
    base: "main",
    head_sha: "a1b2c3d4",
    additions: 10,
    deletions: 2,
    files_count: 1,
    status: "reviewed",
    score: 61,
    ...o,
  };
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      <PRRow pr={pr} repoId="r1" />
    </NextIntlClientProvider>,
  );
}

describe("PRRow — cost column", () => {
  it("shows the latest review's cost", () => {
    renderRow({ cost_usd: 0.012 });
    expect(screen.getByTitle("Run cost")).toHaveTextContent("$0.012");
  });

  it.each([null, undefined])("shows a dash when the cost is %s", (cost_usd) => {
    renderRow({ cost_usd });
    expect(screen.getByTitle("Run cost")).toHaveTextContent("—");
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });

  it("keeps header columns, grid tracks and row cells in step", () => {
    const { container } = renderRow({ cost_usd: 0.012 });
    expect(GRID.split(" ")).toHaveLength(COLUMN_KEYS.length);
    expect(container.firstElementChild!.children).toHaveLength(COLUMN_KEYS.length);
    expect(messages.list.columns.cost).toBe("Cost");
  });
});
