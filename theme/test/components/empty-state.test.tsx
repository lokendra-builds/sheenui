import { expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { Button } from "../../src/components/button/button";
import { EmptyState } from "../../src/components/empty-state/empty-state";
import { reduceMotion } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

const icon = (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <circle cx="12" cy="12" r="8" />
  </svg>
);
const live = () => document.querySelector<HTMLElement>("[data-slot=empty-state-announcer]");

describeVariants((variant) => {
  it("renders a heading (h3 by default), description, both actions and children", () => {
    renderUi(
      <EmptyState
        icon={icon}
        title="No projects yet"
        description="Create your first project to get started."
        action={<Button>Create project</Button>}
        secondaryAction={<Button variant="ghost">Import</Button>}
      >
        <p>Extra content</p>
      </EmptyState>,
      variant,
    );
    expect(screen.getByRole("heading", { level: 3, name: "No projects yet" })).toBeInTheDocument();
    expect(screen.getByText("Create your first project to get started.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create project" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import" })).toBeInTheDocument();
    expect(screen.getByText("Extra content")).toBeInTheDocument();
  });

  it("headingLevel changes the heading level; variant 'compact' is a single row", () => {
    renderUi(
      <EmptyState
        variant="compact"
        headingLevel={2}
        title="Nothing here"
        data-testid="e"
        action={<Button>Add</Button>}
      />,
      variant,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Nothing here" })).toBeInTheDocument();
    expect(screen.getByTestId("e")).toHaveAttribute("data-variant", "compact");
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("the icon and illustration are decorative", () => {
    renderUi(<EmptyState icon={icon} title="Empty" data-testid="e" />, variant);
    const hidden = screen.getByTestId("e").querySelector("[aria-hidden]")!;
    expect(hidden.querySelector("svg")).toBeInTheDocument();
  });

  it("announce speaks title + description once through one persistent polite region", async () => {
    const { rerender } = renderUi(
      <EmptyState title="No results" description="Try a different search." announce />,
      variant,
    );
    await expect.poll(() => live()?.textContent).toBe("No results. Try a different search.");
    expect(live()).toHaveAttribute("role", "status");
    expect(live()).toHaveAttribute("aria-live", "polite");
    // A custom string replaces the derived message; the same region is reused.
    const region = live();
    rerender(<EmptyState title="No results" announce="Zero matches for your filter" />);
    await expect.poll(() => live()?.textContent).toBe("Zero matches for your filter");
    expect(live()).toBe(region);
  });

  it("does not create a live region without `announce`", () => {
    document.querySelector("[data-slot=empty-state-announcer]")?.remove();
    renderUi(<EmptyState title="Quiet" />, variant);
    expect(live()).toBeNull();
  });

  it("has no axe violations (all surfaces and tones)", async () => {
    renderUi(
      <div>
        {(["accent", "neutral", "success", "warning", "danger"] as const).map((tone) => (
          <EmptyState
            key={tone}
            tone={tone}
            surface="glass"
            icon={icon}
            title={`Tone ${tone}`}
            description="Description"
            action={<Button>Go</Button>}
          />
        ))}
        <EmptyState surface="dashed" title="Dashed" />
        <EmptyState variant="compact" surface="glass" icon={icon} title="Compact" />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});

it("reduced motion shows the content immediately (no hidden initial state)", () => {
  reduceMotion();
  renderUi(<EmptyState title="Settled" description="Visible at once" />);
  expect(screen.getByRole("heading", { name: "Settled" })).toBeVisible();
});
