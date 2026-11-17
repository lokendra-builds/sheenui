// Parts that only make sense inside a parent: each is rendered in it, shows up, forwards className and (where it takes one)
// ref, and does its one job.

import { createRef } from "react";
import { expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "vitest/browser";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogIcon,
  AlertDialogTitle,
} from "../../src/components/alert-dialog/alert-dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerSwipeArea,
  DrawerTitle,
} from "../../src/components/drawer/drawer";
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "../../src/components/morphing-dialog/morphing-dialog";
import {
  SideDrawer,
  SideDrawerCloseButton,
  SideDrawerContent,
  SideDrawerDescription,
  SideDrawerNotice,
  SideDrawerTitle,
} from "../../src/components/side-drawer/side-drawer";
import { SideDrawerRecordNav } from "../../src/components/side-drawer/side-drawer-detail";
import { settle } from "../helpers";
import { renderUi } from "../render";

it("AlertDialogIcon draws the dialog's tone icon and takes a className; AlertDialogClose is a button that closes it", async () => {
  renderUi(
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogIcon className="x-icon" />
        <AlertDialogTitle>Delete?</AlertDialogTitle>
        <AlertDialogDescription>Gone for good.</AlertDialogDescription>
        <AlertDialogClose className="x-close">Dismiss</AlertDialogClose>
      </AlertDialogContent>
    </AlertDialog>,
  );
  await expect.poll(() => document.querySelector(".x-icon")).not.toBeNull();
  expect(document.querySelector(".x-icon svg")).not.toBeNull();
  const close = screen.getByRole("button", { name: "Dismiss" });
  expect(close).toHaveClass("x-close");
  await userEvent.click(close);
  await expect.poll(() => screen.queryByRole("alertdialog")).toBeNull();
});

it("DrawerHandle shows inside an open drawer and takes a className; DrawerSwipeArea forwards className and ref", async () => {
  const ref = createRef<HTMLDivElement>();
  renderUi(
    <Drawer defaultOpen>
      <DrawerSwipeArea className="x-swipe" ref={ref} />
      <DrawerContent>
        <DrawerHandle className="x-handle" />
        <DrawerTitle>Filters</DrawerTitle>
        <DrawerDescription>Narrow the list.</DrawerDescription>
      </DrawerContent>
    </Drawer>,
  );
  await expect.poll(() => document.querySelector(".x-handle")).not.toBeNull();
  expect(document.querySelector(".x-swipe")).not.toBeNull();
  expect(ref.current).toBe(document.querySelector(".x-swipe"));
});

it("MorphingDialogClose is a named button that closes the open dialog", async () => {
  renderUi(
    <MorphingDialog>
      <MorphingDialogTrigger>Open card</MorphingDialogTrigger>
      <MorphingDialogContent showClose={false}>
        <MorphingDialogTitle>Card</MorphingDialogTitle>
        <MorphingDialogClose className="x-morph-close" labels={{ close: "Fermer" }} />
      </MorphingDialogContent>
    </MorphingDialog>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Open card" }));
  const close = await screen.findByRole("button", { name: "Fermer" });
  expect(close).toHaveClass("x-morph-close");
  await userEvent.click(close);
  await expect.poll(() => screen.queryByRole("dialog")).toBeNull();
});

it("SideDrawerTitle, SideDrawerDescription and SideDrawerCloseButton name, describe and close the drawer, and take classNames", async () => {
  renderUi(
    <SideDrawer defaultOpen>
      <SideDrawerContent size="sm">
        <SideDrawerTitle className="x-title">Edit profile</SideDrawerTitle>
        <SideDrawerDescription className="x-desc">Visible to your team.</SideDrawerDescription>
        <SideDrawerNotice className="x-notice" />
        <SideDrawerCloseButton className="x-close" />
      </SideDrawerContent>
    </SideDrawer>,
  );
  const dialog = await screen.findByRole("dialog");
  await expect.poll(() => dialog.getAttribute("aria-labelledby")).not.toBeNull();
  expect(dialog).toHaveAccessibleName("Edit profile");
  expect(dialog).toHaveAccessibleDescription("Visible to your team.");
  expect(document.querySelector(".x-title")).toHaveTextContent("Edit profile");
  // No notice has been posted, so the notice part draws nothing.
  expect(document.querySelector(".x-notice")).toBeNull();
  const close = document.querySelector<HTMLButtonElement>(".x-close")!;
  expect(close).not.toBeNull();
  await userEvent.click(close);
  await settle();
  await expect.poll(() => screen.queryByRole("dialog")).toBeNull();
});

it("SideDrawerRecordNav moves between records with its buttons and reports the new index", async () => {
  const onIndexChange = vi.fn();
  renderUi(<SideDrawerRecordNav index={1} count={3} onIndexChange={onIndexChange} className="x-nav" />);
  expect(document.querySelector(".x-nav")).not.toBeNull();
  const buttons = screen.getAllByRole("button");
  expect(buttons.length).toBeGreaterThanOrEqual(2);
  await userEvent.click(buttons[buttons.length - 1]!);
  expect(onIndexChange).toHaveBeenCalledWith(2);
  await userEvent.click(buttons[0]!);
  expect(onIndexChange).toHaveBeenLastCalledWith(0);
});
