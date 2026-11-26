import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../messages/en/prReview.json";
import { RunCostBadge } from "./RunCostBadge";

afterEach(cleanup);

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("RunCostBadge", () => {
  it("compact shows the price only, even when tokens are known", () => {
    renderWithIntl(<RunCostBadge costUsd={0.012} tokensIn={8200} tokensOut={1300} />);
    expect(screen.getByText("$0.012")).toBeInTheDocument();
    expect(screen.getByTitle("Run cost")).toBeInTheDocument();
  });

  it("detailed shows the price and token usage", () => {
    renderWithIntl(
      <RunCostBadge variant="detailed" costUsd={0.014} tokensIn={8200} tokensOut={1300} />,
    );
    expect(screen.getByText("$0.014 · 8.2K→1.3K")).toBeInTheDocument();
  });

  it("detailed keeps the tokens when only the price is unknown", () => {
    renderWithIntl(
      <RunCostBadge variant="detailed" costUsd={null} tokensIn={8200} tokensOut={1300} />,
    );
    expect(screen.getByText("— · 8.2K→1.3K")).toBeInTheDocument();
  });

  it.each(["compact", "detailed"] as const)("%s shows a dash without data", (variant) => {
    renderWithIntl(<RunCostBadge variant={variant} costUsd={undefined} />);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });
});
