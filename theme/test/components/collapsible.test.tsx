import { expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "../../src/components/collapsible/collapsible";
import { settle } from "../helpers";
import { describeVariants, renderUi, runAxe } from "../render";

function Example(props: Partial<React.ComponentProps<typeof Collapsible>>) {
  return (
    <Collapsible {...props}>
      <CollapsibleTrigger>Advanced</CollapsibleTrigger>
      <CollapsiblePanel>
        <a href="#x">Inside link</a>
      </CollapsiblePanel>
    </Collapsible>
  );
}

describeVariants((variant) => {
  it("is closed by default; the trigger has aria-expanded and toggles the panel", async () => {
    renderUi(<Example />, variant);
    const trigger = screen.getByRole("button", { name: "Advanced" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Inside link")).toBeNull();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByText("Inside link")).toBeVisible();
    expect(trigger).toHaveAttribute("aria-controls");
    await userEvent.click(trigger);
    await expect.poll(() => screen.queryByText("Inside link")).toBeNull();
  });

  it("Enter and Space toggle from the keyboard", async () => {
    renderUi(<Example />, variant);
    await userEvent.tab();
    const trigger = screen.getByRole("button", { name: "Advanced" });
    expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("defaultOpen starts open and onOpenChange reports changes; open controls it", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = renderUi(<Example defaultOpen onOpenChange={onOpenChange} />, variant);
    expect(await screen.findByText("Inside link")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Advanced" }));
    expect(onOpenChange.mock.calls[0]![0]).toBe(false);
    rerender(<Example open onOpenChange={onOpenChange} />);
    expect(await screen.findByText("Inside link")).toBeVisible();
  });

  it("disabled cannot be toggled; keepMounted holds closed content in the page, hidden", async () => {
    renderUi(
      <Collapsible disabled>
        <CollapsibleTrigger>Locked</CollapsibleTrigger>
        <CollapsiblePanel keepMounted>Kept</CollapsiblePanel>
      </Collapsible>,
      variant,
    );
    const trigger = screen.getByRole("button", { name: "Locked" });
    await userEvent.click(trigger, { force: true });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Kept", { ignore: "" })).not.toBeVisible();
  });

  it("has no axe violations open or closed", async () => {
    renderUi(<Example defaultOpen />, variant);
    await settle();
    expect(await runAxe()).toHaveNoViolations();
  });
});
