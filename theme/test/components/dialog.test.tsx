import { expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import { Button } from "../../src/components/button/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../src/components/dialog/dialog";
import { Input } from "../../src/components/input/input";
import { describeVariants, renderUi, runAxe } from "../render";

function Example() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="glass" />}>Edit profile</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here.</DialogDescription>
        </DialogHeader>
        <Input label="Display name" defaultValue="Ava" />
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <DialogClose render={<Button />}>Save</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const dialog = () => screen.queryByRole("dialog");

describeVariants((variant) => {
  it("opens from its trigger, is labelled, traps focus and closes with Escape", async () => {
    renderUi(<Example />, variant);
    expect(dialog()).toBeNull();
    const trigger = screen.getByRole("button", { name: "Edit profile" });

    await userEvent.click(trigger);
    await expect.poll(dialog).not.toBeNull();
    const panel = dialog()!;
    expect(panel).toHaveAccessibleName("Edit profile");
    expect(panel).toHaveAccessibleDescription("Make changes to your profile here.");
    // Modal: everything outside the dialog is hidden from assistive tech (Base UI marks the
    // outside `aria-hidden` / `inert`, depending on the browser), so the trigger leaves the
    // accessibility tree.
    expect(trigger.closest("[inert], [aria-hidden='true']")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Edit profile" })).toBeNull();
    // Focus lands inside the dialog, and Tab stays inside it.
    await expect.poll(() => panel.contains(document.activeElement)).toBe(true);
    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      // Poll: Base UI's focus guards hand focus back a tick later, which is slower under machine load.
      await expect.poll(() => panel.contains(document.activeElement)).toBe(true);
    }

    await userEvent.keyboard("{Escape}");
    await expect.poll(dialog).toBeNull();
    // Focus returns to the trigger.
    await expect.poll(() => document.activeElement).toBe(screen.getByRole("button", { name: "Edit profile" }));
  });

  it("closes from the × button and from a DialogClose action", async () => {
    renderUi(<Example />, variant);
    await userEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await expect.poll(dialog).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    await expect.poll(dialog).not.toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await expect.poll(dialog).toBeNull();
  });

  it("has no axe violations while open", async () => {
    renderUi(<Example />, variant);
    await userEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    await expect.poll(dialog).not.toBeNull();
    expect(await runAxe()).toHaveNoViolations();
  });
});
