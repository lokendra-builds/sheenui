// Tab and Shift+Tab stay inside an open Dialog, AlertDialog, Drawer and SideDrawer at once (no waiting for
// Base UI's focus guards, which hand focus back only on the next animation frame), and Escape always closes.

import { expect, it } from "vitest";
import type { ReactElement } from "react";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../src/components/alert-dialog/alert-dialog";
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
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../src/components/drawer/drawer";
import { Input } from "../../src/components/input/input";
import { Select } from "../../src/components/select/select";
import {
  SideDrawer,
  SideDrawerBody,
  SideDrawerClose,
  SideDrawerContent,
  SideDrawerFooter,
  SideDrawerHeader,
  SideDrawerTrigger,
} from "../../src/components/side-drawer/side-drawer";
import { settle } from "../helpers";
import { renderUi, variants } from "../render";

const variant = variants[0]!;

const cases: { name: string; role: "dialog" | "alertdialog"; trigger: string; ui: ReactElement }[] = [
  {
    name: "Dialog",
    role: "dialog",
    trigger: "Edit profile",
    ui: (
      <Dialog>
        <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes here.</DialogDescription>
          </DialogHeader>
          <Input label="Display name" defaultValue="Ava" />
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <DialogClose render={<Button />}>Save</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  },
  {
    name: "AlertDialog",
    role: "alertdialog",
    trigger: "Delete project",
    ui: (
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="danger" />}>Delete project</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
  },
  {
    name: "Drawer",
    role: "dialog",
    trigger: "Open filters",
    ui: (
      <Drawer>
        <DrawerTrigger render={<Button />}>Open filters</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>Narrow the results.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <Input label="Keyword" />
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button variant="ghost" />}>Reset</DrawerClose>
            <DrawerClose render={<Button />}>Apply</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    ),
  },
  {
    name: "SideDrawer",
    role: "dialog",
    trigger: "Open panel",
    ui: (
      <SideDrawer>
        <SideDrawerTrigger render={<Button />}>Open panel</SideDrawerTrigger>
        <SideDrawerContent size="sm" resizable>
          <SideDrawerHeader title="Edit profile" description="Visible to your team." />
          <SideDrawerBody>
            <Input label="Display name" defaultValue="Ava" />
          </SideDrawerBody>
          <SideDrawerFooter>
            <SideDrawerClose render={<Button variant="ghost" />}>Done</SideDrawerClose>
          </SideDrawerFooter>
        </SideDrawerContent>
      </SideDrawer>
    ),
  },
];

for (const c of cases) {
  it(`${c.name}: Tab and Shift+Tab cycle inside it with no gap, and Escape closes it`, async () => {
    renderUi(
      <div>
        <button>page button before</button>
        {c.ui}
        <button>page button after</button>
      </div>,
      variant,
    );
    await userEvent.click(screen.getByRole("button", { name: c.trigger }));
    await expect.poll(() => screen.queryByRole(c.role)).not.toBeNull();
    await settle();
    const panel = screen.getByRole(c.role);
    await expect.poll(() => panel.contains(document.activeElement)).toBe(true);

    const tabbables = () =>
      [...panel.querySelectorAll<HTMLElement>("button, input, a[href], [tabindex]")].filter(
        (el) =>
          el.tabIndex >= 0 &&
          el.getClientRects().length > 0 &&
          !el.hasAttribute("data-base-ui-focus-guard") &&
          !el.matches(":disabled"),
      );
    const first = tabbables()[0]!;
    const last = tabbables().at(-1)!;
    expect(first).not.toBe(last);

    // From the last control, Tab wraps to the first in the same task; from the first, Shift+Tab goes to the last.
    last.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(first);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(last);

    // The wrap is decided inside the keydown itself (no frame later): a synthetic Tab at each end is cancelled
    // and has already moved focus when dispatch returns, which Base UI's guards alone do not do.
    const press = (shiftKey: boolean) => {
      const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey, bubbles: true, cancelable: true });
      document.activeElement?.dispatchEvent(event);
      return event.defaultPrevented;
    };
    last.focus();
    expect(press(false)).toBe(true);
    expect(document.activeElement).toBe(first);
    expect(press(true)).toBe(true);
    expect(document.activeElement).toBe(last);

    // Many presses in a row, never checking after a pause: focus is inside the popup after every one.
    for (let i = 0; i < 12; i++) {
      await userEvent.tab();
      expect(panel.contains(document.activeElement)).toBe(true);
    }
    for (let i = 0; i < 12; i++) {
      await userEvent.tab({ shift: true });
      expect(panel.contains(document.activeElement)).toBe(true);
    }

    await userEvent.keyboard("{Escape}");
    await expect.poll(() => screen.queryByRole(c.role)).toBeNull();
  });
}

const fruit = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
];

it("a Select inside a Dialog stays reachable by keyboard: Tab finds it, its list opens, Escape closes the list first and then the Dialog", async () => {
  renderUi(
    <div>
      <button>page button before</button>
      <Dialog>
        <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes here.</DialogDescription>
          </DialogHeader>
          <Input label="Display name" defaultValue="Ava" />
          <Select label="Fruit" items={fruit} defaultValue="apple" />
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <button>page button after</button>
    </div>,
    variant,
  );
  await userEvent.click(screen.getByRole("button", { name: "Edit profile" }));
  await expect.poll(() => screen.queryByRole("dialog")).not.toBeNull();
  await settle();
  const dialog = screen.getByRole("dialog");
  await expect.poll(() => dialog.contains(document.activeElement)).toBe(true);

  // Keyboard only: Tab until the Select trigger has focus (within a full lap, and never outside the dialog).
  const trigger = screen.getByRole("combobox", { name: "Fruit" });
  for (let i = 0; i < 8 && document.activeElement !== trigger; i++) {
    await userEvent.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  }
  expect(document.activeElement).toBe(trigger);

  await userEvent.keyboard("{ArrowDown}");
  await expect.poll(() => screen.queryByRole("listbox")).not.toBeNull();
  // The list is portalled outside the dialog: Tab inside it is not wrapped or blocked by the dialog's trap, and the arrow keys work.
  await expect.poll(() => document.querySelector('[role="option"][data-highlighted]')).not.toBeNull();
  await userEvent.keyboard("{ArrowDown}");
  await expect.poll(() => document.querySelector('[role="option"][data-highlighted]')?.textContent).toContain("Banana");

  // Escape closes the list only; the dialog stays open and focus returns to the Select.
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => screen.queryByRole("listbox")).toBeNull();
  expect(screen.queryByRole("dialog")).not.toBeNull();
  await expect.poll(() => document.activeElement).toBe(trigger);
  // The trap still holds afterwards.
  for (let i = 0; i < 10; i++) {
    await userEvent.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  }
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => screen.queryByRole("dialog")).toBeNull();
});

it("a Dialog opened from inside a Dialog traps its own Tab, and Escape closes the inner one first and returns focus to its trigger", async () => {
  renderUi(
    <div>
      <button>page button before</button>
      <Dialog>
        <DialogTrigger render={<Button />}>Outer</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Outer dialog</DialogTitle>
            <DialogDescription>Has another dialog.</DialogDescription>
          </DialogHeader>
          <Dialog>
            <DialogTrigger render={<Button />}>Inner</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inner dialog</DialogTitle>
                <DialogDescription>Nested.</DialogDescription>
              </DialogHeader>
              <Input label="Name" />
              <DialogFooter>
                <DialogClose render={<Button variant="ghost" />}>Close inner</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Close outer</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>,
    variant,
  );
  await userEvent.click(screen.getByRole("button", { name: "Outer" }));
  await expect.poll(() => screen.queryByRole("dialog", { name: "Outer dialog" })).not.toBeNull();
  await settle();
  const outer = screen.getByRole("dialog", { name: "Outer dialog" });
  const innerTrigger = screen.getByRole("button", { name: "Inner" });
  innerTrigger.focus();
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => screen.queryByRole("dialog", { name: "Inner dialog" })).not.toBeNull();
  await settle();
  const inner = screen.getByRole("dialog", { name: "Inner dialog" });
  await expect.poll(() => inner.contains(document.activeElement)).toBe(true);

  // Tab and Shift+Tab stay in the inner dialog (the outer one is behind it and must not take the focus back).
  for (let i = 0; i < 12; i++) {
    await userEvent.tab();
    expect(inner.contains(document.activeElement)).toBe(true);
  }
  for (let i = 0; i < 12; i++) {
    await userEvent.tab({ shift: true });
    expect(inner.contains(document.activeElement)).toBe(true);
  }

  await userEvent.keyboard("{Escape}");
  await expect.poll(() => screen.queryByRole("dialog", { name: "Inner dialog" })).toBeNull();
  expect(outer.isConnected).toBe(true);
  await expect.poll(() => document.activeElement).toBe(innerTrigger);
  for (let i = 0; i < 8; i++) {
    await userEvent.tab();
    expect(outer.contains(document.activeElement)).toBe(true);
  }
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => screen.queryByRole("dialog")).toBeNull();
});
