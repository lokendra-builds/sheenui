import { expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Stepper, type StepperStep } from "../../src/components/stepper/stepper";
import { describeVariants, renderUi, runAxe } from "../render";

const steps: StepperStep[] = [
  { title: "Account", description: "Create your login" },
  { title: "Profile", optional: true },
  { title: "Billing", content: <p>Billing form goes here</p> },
  { title: "Review", disabled: true },
];

const nav = () => screen.getByRole("navigation", { name: "Progress" });
const items = () => within(nav()).getAllByRole("listitem");

describeVariants((variant) => {
  it("is a named nav with an ordered list; the current step has aria-current and statuses are spoken", () => {
    renderUi(<Stepper steps={steps} current={1} collapse="never" />, variant);
    expect(within(nav()).getByRole("list").tagName).toBe("OL");
    expect(items()).toHaveLength(4);
    expect(items()[1]).toHaveAttribute("aria-current", "step");
    expect(items()[0]).not.toHaveAttribute("aria-current");
    // Status words follow each title for screen readers.
    expect(items()[0]).toHaveTextContent("Account, completed");
    expect(items()[1]).toHaveTextContent("Profile, current step");
    expect(items()[2]).toHaveTextContent("Billing, not started");
    expect(items()[1]).toHaveTextContent("Optional");
  });

  it("error status wins over the derived one; status can be set per step", () => {
    renderUi(
      <Stepper
        steps={[{ title: "One" }, { title: "Two", status: "error" }, { title: "Three" }]}
        current={1}
        collapse="never"
      />,
      variant,
    );
    expect(items()[1]!.textContent).toMatch(/current step, needs attention/);
  });

  it("current === steps.length marks every step complete", () => {
    renderUi(<Stepper steps={steps} current={steps.length} collapse="never" />, variant);
    for (const li of items()) expect(li).toHaveTextContent("completed");
    expect(nav().querySelector("[aria-current=step]")).toBeNull();
  });

  it("static by default (no buttons); onStepClick makes completed steps buttons", async () => {
    const onStepClick = vi.fn();
    const { rerender } = renderUi(<Stepper steps={steps} current={2} collapse="never" />, variant);
    expect(within(nav()).queryAllByRole("button")).toHaveLength(0);
    rerender(<Stepper steps={steps} current={2} collapse="never" onStepClick={onStepClick} />);
    const buttons = within(nav()).getAllByRole("button");
    // Completed steps act; the current step is a button but aria-disabled.
    expect(buttons.map((b) => b.getAttribute("aria-disabled"))).toContain("true");
    await userEvent.click(within(nav()).getByRole("button", { name: /Account/ }));
    expect(onStepClick).toHaveBeenLastCalledWith(0);
    // The current step is an aria-disabled button: activating it does nothing.
    within(nav())
      .getByRole("button", { name: /Billing/ })
      .click();
    expect(onStepClick).toHaveBeenCalledTimes(1);
  });

  it('clickable="all" lets people jump ahead, but not to a disabled step; keyboard Tab/Enter work', async () => {
    const onStepClick = vi.fn();
    renderUi(
      <>
        <button>before</button>
        <Stepper steps={steps} current={0} collapse="never" onStepClick={onStepClick} clickable="all" />
      </>,
      variant,
    );
    screen.getByRole("button", { name: "before" }).focus();
    await userEvent.tab();
    // The current step is focusable (aria-disabled) so focus survives activation.
    expect(document.activeElement).toBe(within(nav()).getAllByRole("button")[0]);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onStepClick).toHaveBeenLastCalledWith(1);
    // A disabled step is plain text, not a button.
    expect(within(nav()).queryByRole("button", { name: /Review/ })).toBeNull();
    expect(onStepClick).toHaveBeenCalledTimes(1);
  });

  it("vertical orientation shows the current step's content", () => {
    renderUi(<Stepper steps={steps} current={2} orientation="vertical" />, variant);
    expect(screen.getByText("Billing form goes here")).toBeInTheDocument();
    renderUi(<Stepper steps={steps} current={1} orientation="vertical" />, variant);
    expect(screen.getAllByText("Billing form goes here")).toHaveLength(1);
  });

  it("collapse=always shows 'Step x of y' and the next step; at the end it says all done", () => {
    const { rerender } = renderUi(<Stepper steps={steps} current={1} collapse="always" />, variant);
    expect(within(nav()).getByText("Step 2 of 4")).toBeInTheDocument();
    expect(within(nav()).getByText("Billing")).toBeInTheDocument();
    rerender(<Stepper steps={steps} current={4} collapse="always" />);
    expect(within(nav()).getByText("All steps complete")).toBeInTheDocument();
  });

  it("collapse=auto folds into the compact view when the container is too narrow", async () => {
    renderUi(
      <div style={{ width: 200 }}>
        <Stepper steps={steps} current={1} />
      </div>,
      variant,
    );
    await expect.poll(() => within(nav()).queryByText("Step 2 of 4")).not.toBeNull();
  });

  it("labels override every string (i18n)", () => {
    renderUi(
      <Stepper
        steps={[{ title: "Eins" }, { title: "Zwei" }]}
        current={0}
        collapse="never"
        labels={{ nav: "Fortschritt", current: "aktuell", upcoming: "offen", status: (w) => ` (${w.join(", ")})` }}
      />,
      variant,
    );
    const n = screen.getByRole("navigation", { name: "Fortschritt" });
    expect(within(n).getAllByRole("listitem")[0]).toHaveTextContent("Eins (aktuell)");
    expect(within(n).getAllByRole("listitem")[1]).toHaveTextContent("Zwei (offen)");
  });

  it("has no axe violations (horizontal, vertical, compact, clickable)", async () => {
    renderUi(
      <div className="grid gap-8">
        <Stepper steps={steps} current={1} collapse="never" labels={{ nav: "Horizontal" }} />
        <Stepper
          steps={steps}
          current={2}
          orientation="vertical"
          labels={{ nav: "Vertical" }}
          onStepClick={() => undefined}
        />
        <Stepper steps={steps} current={1} collapse="always" labels={{ nav: "Compact" }} />
        <Stepper
          steps={steps}
          current={1}
          collapse="never"
          labelPlacement="end"
          size="sm"
          labels={{ nav: "End labels" }}
          onStepClick={() => undefined}
          clickable="all"
        />
      </div>,
      variant,
    );
    expect(await runAxe()).toHaveNoViolations();
  });
});
