import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../../../../../../messages/en/prReview.json";

let running = false;

vi.mock("../../../../../../../lib/hooks/reviews", () => ({
  useRunEvents: () => ({ events: [], running }),
}));

import { RunStatus } from "./RunStatus";

afterEach(() => {
  cleanup();
  running = false;
});

function withIntl(ui: React.ReactElement) {
  return (
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      {ui}
    </NextIntlClientProvider>
  );
}

function renderWithIntl(ui: React.ReactElement) {
  return render(withIntl(ui));
}

describe("RunStatus (smoke)", () => {
  it("renders nothing when there are no run ids", () => {
    const { container } = renderWithIntl(<RunStatus runIds={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("RunStatus — onDone", () => {
  /** Mount, then re-render with a NEW callback identity each time (as the PR page does). */
  function mount() {
    const onDone = vi.fn();
    const ui = () => withIntl(<RunStatus runIds={["run-1"]} onDone={() => onDone()} />);
    const { rerender } = render(ui());
    return {
      onDone,
      step: (next: boolean) => {
        running = next;
        rerender(ui());
      },
    };
  }

  it("does not fire before anything has run", () => {
    const { onDone, step } = mount();
    step(false);
    step(false);
    expect(onDone).not.toHaveBeenCalled();
  });

  it("fires once when the run settles, however often the parent re-renders", () => {
    const { onDone, step } = mount();
    step(true);
    step(true);
    expect(onDone).not.toHaveBeenCalled();
    step(false);
    step(false);
    step(false);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("fires again for the next run", () => {
    const { onDone, step } = mount();
    step(true);
    step(false);
    step(true);
    step(false);
    step(false);
    expect(onDone).toHaveBeenCalledTimes(2);
  });
});
